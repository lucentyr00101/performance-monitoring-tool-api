import { Goal, type GoalDocument, type KeyResultDocument } from '@goals/models/index.js';
import { AppError, parsePagination } from '@pmt/shared';
import type { FilterQuery } from 'mongoose';
import type { z } from 'zod';
import type { goalQuerySchema } from '@pmt/shared';

const LOG_PREFIX = '[GoalService]';

export interface CreateGoalDTO {
  title: string;
  description?: string;
  type: 'individual' | 'team' | 'department' | 'company';
  ownerId: string;
  parentGoalId?: string;
  startDate?: Date;
  dueDate?: Date;
  keyResults?: {
    title: string;
    description?: string;
    targetValue: number;
    unit?: string;
  }[];
}

export interface UpdateGoalDTO extends Partial<Omit<CreateGoalDTO, 'keyResults'>> {
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface CreateKeyResultDTO {
  title: string;
  description?: string;
  targetValue: number;
  unit?: string;
}

export interface UpdateKeyResultDTO {
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status?: 'in_progress' | 'completed' | 'cancelled';
}

type GoalQueryParams = z.infer<typeof goalQuerySchema>;

export class GoalService {
  /**
   * List goals with pagination and filtering
   */
  async listGoals(
    params: GoalQueryParams
  ): Promise<{ goals: GoalDocument[]; total: number; pagination: ReturnType<typeof parsePagination> }> {
    console.info(`${LOG_PREFIX} Listing goals`, {
      type: params.type,
      status: params.status,
      ownerId: params.owner_id,
      search: params.search,
      page: params.page,
      perPage: params.per_page,
    });

    const { page, perPage, skip, sortBy, sortOrder } = parsePagination(params);

    const query: FilterQuery<GoalDocument> = {};

    if (params.type) query.type = params.type;
    if (params.status) query.status = params.status;
    if (params.owner_id) query.ownerId = params.owner_id;
    if (params.department_id) query.departmentId = params.department_id;
    if (params.parent_goal_id) query.parentGoalId = params.parent_goal_id;
    if (params.search) {
      query.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }
    if (params.due_before) query.dueDate = { $lte: new Date(params.due_before) };
    if (params.due_after) query.dueDate = { ...query.dueDate as object, $gte: new Date(params.due_after) };

    const sortField = sortBy || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [goals, total] = await Promise.all([
      Goal.find(query)
        .populate('ownerId', 'firstName lastName')
        .populate('parentGoalId', 'title status progress')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(perPage),
      Goal.countDocuments(query),
    ]);

    console.info(`${LOG_PREFIX} Goals listed successfully`, {
      count: goals.length,
      total,
      page,
      perPage,
    });

    return {
      goals,
      total,
      pagination: { page, perPage, skip, sortBy: sortField, sortOrder },
    };
  }

  /**
   * Get goal by ID
   */
  async getGoalById(id: string): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Getting goal by ID`, { goalId: id });

    const goal = await Goal.findById(id)
      .populate('ownerId', 'firstName lastName')
      .populate('parentGoalId', 'title status progress');

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found`, { goalId: id });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    console.info(`${LOG_PREFIX} Goal retrieved`, { goalId: id, title: goal.title });

    return goal;
  }

  /**
   * Create a new goal
   */
  async createGoal(data: CreateGoalDTO): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Creating goal`, {
      title: data.title,
      type: data.type,
      ownerId: data.ownerId,
      parentGoalId: data.parentGoalId,
      keyResultsCount: data.keyResults?.length ?? 0,
    });

    // Validate dates if both are provided
    if (data.startDate && data.dueDate && new Date(data.dueDate) <= new Date(data.startDate)) {
      console.warn(`${LOG_PREFIX} Date validation failed`, {
        startDate: data.startDate,
        dueDate: data.dueDate,
      });
      throw new AppError('VALIDATION_ERROR', 'Due date must be after start date', 422);
    }

    // Verify parent goal exists if provided
    if (data.parentGoalId) {
      const parentGoal = await Goal.findById(data.parentGoalId);
      if (!parentGoal) {
        console.warn(`${LOG_PREFIX} Parent goal not found`, { parentGoalId: data.parentGoalId });
        throw new AppError('NOT_FOUND', 'Parent goal not found', 404);
      }
    }

    const goalData = {
      title: data.title,
      description: data.description,
      type: data.type,
      ownerId: data.ownerId,
      parentGoalId: data.parentGoalId,
      startDate: data.startDate,
      dueDate: data.dueDate,
      keyResults: data.keyResults?.map(kr => ({
        title: kr.title,
        description: kr.description,
        targetValue: kr.targetValue,
        currentValue: 0,
        unit: kr.unit,
        status: 'in_progress',
      })) || [],
    };

    const goal = await Goal.create(goalData);

    console.info(`${LOG_PREFIX} Goal created successfully`, {
      goalId: goal._id.toString(),
      title: goal.title,
      type: goal.type,
    });

    return goal.populate([
      { path: 'ownerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Update a goal
   */
  async updateGoal(id: string, data: UpdateGoalDTO): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Updating goal`, {
      goalId: id,
      updates: Object.keys(data),
    });

    const goal = await Goal.findById(id);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for update`, { goalId: id });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    // Validate dates if being updated
    const startDate = data.startDate || goal.startDate;
    const dueDate = data.dueDate || goal.dueDate;
    if (startDate && dueDate && new Date(dueDate) <= new Date(startDate)) {
      console.warn(`${LOG_PREFIX} Date validation failed on update`, {
        goalId: id,
        startDate,
        dueDate,
      });
      throw new AppError('VALIDATION_ERROR', 'Due date must be after start date', 422);
    }

    // If marking as completed, set completed date
    if (data.status === 'completed' && goal.status !== 'completed') {
      goal.completedAt = new Date();
    }

    Object.assign(goal, data);
    await goal.save();

    console.info(`${LOG_PREFIX} Goal updated successfully`, {
      goalId: id,
      title: goal.title,
      status: goal.status,
    });

    return goal.populate([
      { path: 'ownerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<void> {
    console.info(`${LOG_PREFIX} Deleting goal`, { goalId: id });

    const goal = await Goal.findById(id);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for deletion`, { goalId: id });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    // Check if there are child goals
    const childGoals = await Goal.countDocuments({ parentGoalId: id });
    if (childGoals > 0) {
      console.warn(`${LOG_PREFIX} Cannot delete goal with child goals`, {
        goalId: id,
        childGoalsCount: childGoals,
      });
      throw new AppError('CONFLICT', 'Cannot delete goal with child goals', 409);
    }

    await goal.deleteOne();

    console.info(`${LOG_PREFIX} Goal deleted successfully`, {
      goalId: id,
      title: goal.title,
    });
  }

  /**
   * Update goal progress
   */
  async updateProgress(id: string, progress: number, note?: string): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Updating goal progress`, {
      goalId: id,
      progress,
      hasNote: !!note,
    });

    const goal = await Goal.findById(id);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for progress update`, { goalId: id });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    if (progress < 0 || progress > 100) {
      console.warn(`${LOG_PREFIX} Invalid progress value`, {
        goalId: id,
        progress,
      });
      throw new AppError('VALIDATION_ERROR', 'Progress must be between 0 and 100', 422);
    }

    const previousProgress = goal.progress;
    goal.progress = progress;

    // Auto-update status based on progress
    if (progress === 100 && goal.status === 'active') {
      goal.status = 'completed';
      goal.completedAt = new Date();
    }

    await goal.save();

    console.info(`${LOG_PREFIX} Goal progress updated successfully`, {
      goalId: id,
      previousProgress,
      newProgress: progress,
      status: goal.status,
    });

    return goal.populate([
      { path: 'ownerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Get key results for a goal
   */
  async getKeyResults(goalId: string): Promise<KeyResultDocument[]> {
    console.info(`${LOG_PREFIX} Getting key results`, { goalId });

    const goal = await Goal.findById(goalId);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for key results`, { goalId });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    console.info(`${LOG_PREFIX} Key results retrieved`, {
      goalId,
      keyResultsCount: goal.keyResults.length,
    });

    return goal.keyResults;
  }

  /**
   * Add key result to a goal
   */
  async addKeyResult(goalId: string, data: CreateKeyResultDTO): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Adding key result`, {
      goalId,
      title: data.title,
      targetValue: data.targetValue,
    });

    const goal = await Goal.findById(goalId);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for adding key result`, { goalId });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    goal.keyResults.push({
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: 0,
      unit: data.unit,
      status: 'in_progress',
    } as KeyResultDocument);
    await goal.save();

    console.info(`${LOG_PREFIX} Key result added successfully`, {
      goalId,
      keyResultsCount: goal.keyResults.length,
    });

    return goal.populate([
      { path: 'ownerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Update a key result
   */
  async updateKeyResult(
    goalId: string,
    keyResultId: string,
    data: UpdateKeyResultDTO
  ): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Updating key result`, {
      goalId,
      keyResultId,
      updates: Object.keys(data),
    });

    const goal = await Goal.findById(goalId);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for key result update`, { goalId });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    const keyResult = goal.keyResults.find(
      (kr) => kr._id.toString() === keyResultId
    );

    if (!keyResult) {
      console.warn(`${LOG_PREFIX} Key result not found`, { goalId, keyResultId });
      throw new AppError('NOT_FOUND', 'Key result not found', 404);
    }

    Object.assign(keyResult, data);

    // Auto-update key result status based on progress
    if (data.currentValue !== undefined && keyResult.targetValue > 0) {
      if (keyResult.currentValue >= keyResult.targetValue) {
        keyResult.status = 'completed';
      } else if (keyResult.currentValue > 0) {
        keyResult.status = 'in_progress';
      }
    }

    await goal.save();

    console.info(`${LOG_PREFIX} Key result updated successfully`, {
      goalId,
      keyResultId,
      status: keyResult.status,
      currentValue: keyResult.currentValue,
      targetValue: keyResult.targetValue,
    });

    return goal.populate([
      { path: 'ownerId', select: 'firstName lastName' },
    ]);
  }

  /**
   * Delete a key result
   */
  async deleteKeyResult(goalId: string, keyResultId: string): Promise<GoalDocument> {
    console.info(`${LOG_PREFIX} Deleting key result`, { goalId, keyResultId });

    const goal = await Goal.findById(goalId);

    if (!goal) {
      console.warn(`${LOG_PREFIX} Goal not found for key result deletion`, { goalId });
      throw new AppError('NOT_FOUND', 'Goal not found', 404);
    }

    const keyResultIndex = goal.keyResults.findIndex(
      (kr) => kr._id.toString() === keyResultId
    );

    if (keyResultIndex === -1) {
      console.warn(`${LOG_PREFIX} Key result not found for deletion`, { goalId, keyResultId });
      throw new AppError('NOT_FOUND', 'Key result not found', 404);
    }

    goal.keyResults.splice(keyResultIndex, 1);
    await goal.save();

    console.info(`${LOG_PREFIX} Key result deleted successfully`, {
      goalId,
      keyResultId,
      remainingKeyResults: goal.keyResults.length,
    });

    return goal.populate([
      { path: 'ownerId', select: 'firstName lastName' },
    ]);
  }
}

export const goalService = new GoalService();
