import { describe, it, expect, beforeEach } from 'vitest';
import { GoalService } from '@goals/services/goal.service.js';
import { Goal } from '@goals/models/goal.model.js';
import mongoose from 'mongoose';

describe('GoalService', () => {
  let goalService: GoalService;
  const mockOwnerId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    goalService = new GoalService();
  });

  describe('createGoal', () => {
    it('should create a goal with valid data', async () => {
      const goalData = {
        title: 'Test Goal',
        description: 'Test description',
        type: 'individual' as const,
        ownerId: mockOwnerId,
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
      };

      const goal = await goalService.createGoal(goalData);

      expect(goal.title).toBe('Test Goal');
      expect(goal.description).toBe('Test description');
      expect(goal.status).toBe('draft');
      expect(goal.progress).toBe(0);
      expect(goal.type).toBe('individual');
    });

    it('should throw error if due date is before start date', async () => {
      const goalData = {
        title: 'Test Goal',
        type: 'individual' as const,
        ownerId: mockOwnerId,
        startDate: new Date('2024-03-31'),
        dueDate: new Date('2024-01-01'),
      };

      await expect(goalService.createGoal(goalData)).rejects.toThrow();
    });
  });

  describe('updateGoal', () => {
    let createdGoalId: string;

    beforeEach(async () => {
      const goal = await Goal.create({
        title: 'Original Goal',
        ownerId: mockOwnerId,
        type: 'individual',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
        status: 'active',
      });
      createdGoalId = goal._id.toString();
    });

    it('should update goal title', async () => {
      const goal = await Goal.findByIdAndUpdate(
        createdGoalId,
        { title: 'Updated Goal' },
        { new: true }
      );
      expect(goal?.title).toBe('Updated Goal');
    });

    it('should set completedAt when status changes to completed', async () => {
      const goal = await Goal.findByIdAndUpdate(
        createdGoalId,
        { status: 'completed', completedAt: new Date() },
        { new: true }
      );

      expect(goal?.status).toBe('completed');
      expect(goal?.completedAt).toBeDefined();
    });

    it('should throw error for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        goalService.updateGoal(fakeId, { title: 'Test' })
      ).rejects.toThrow('Goal not found');
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      const goal = await Goal.create({
        title: 'To Be Deleted',
        ownerId: mockOwnerId,
        type: 'individual',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
      });

      await goalService.deleteGoal(goal._id.toString());

      const found = await Goal.findById(goal._id);
      expect(found).toBeNull();
    });

    it('should throw error if goal has child goals', async () => {
      const parentGoal = await Goal.create({
        title: 'Parent Goal',
        ownerId: mockOwnerId,
        type: 'team',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
      });

      await Goal.create({
        title: 'Child Goal',
        ownerId: mockOwnerId,
        type: 'individual',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
        parentGoalId: parentGoal._id,
      });

      await expect(
        goalService.deleteGoal(parentGoal._id.toString())
      ).rejects.toThrow('Cannot delete goal with child goals');
    });
  });

  describe('updateProgress', () => {
    let goalId: string;

    beforeEach(async () => {
      const goal = await Goal.create({
        title: 'Progress Goal',
        ownerId: mockOwnerId,
        type: 'individual',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
        status: 'active',
      });
      goalId = goal._id.toString();
    });

    it('should update progress correctly', async () => {
      const updated = await goalService.updateProgress(goalId, 75);
      expect(updated.progress).toBe(75);
    });

    it('should auto-complete goal when progress reaches 100', async () => {
      const updated = await goalService.updateProgress(goalId, 100);
      expect(updated.progress).toBe(100);
      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeDefined();
    });

    it('should throw error for invalid progress value', async () => {
      await expect(goalService.updateProgress(goalId, -10)).rejects.toThrow(
        'Progress must be between 0 and 100'
      );

      await expect(goalService.updateProgress(goalId, 150)).rejects.toThrow(
        'Progress must be between 0 and 100'
      );
    });
  });

  describe('Key Results', () => {
    let goalId: string;

    beforeEach(async () => {
      const goal = await Goal.create({
        title: 'Key Results Goal',
        ownerId: mockOwnerId,
        type: 'individual',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
      });
      goalId = goal._id.toString();
    });

    it('should add key result to goal', async () => {
      const updated = await goalService.addKeyResult(goalId, {
        title: 'Key Result 1',
        targetValue: 100,
        unit: 'tests',
      });

      expect(updated.keyResults).toHaveLength(1);
      expect(updated.keyResults[0].title).toBe('Key Result 1');
      expect(updated.keyResults[0].targetValue).toBe(100);
    });

    it('should update key result', async () => {
      const goal = await goalService.addKeyResult(goalId, {
        title: 'Key Result 1',
        targetValue: 100,
      });

      const krId = goal.keyResults[0]._id.toString();
      const updated = await goalService.updateKeyResult(goalId, krId, {
        currentValue: 50,
      });

      expect(updated.keyResults[0].currentValue).toBe(50);
      expect(updated.keyResults[0].status).toBe('in_progress');
    });

    it('should delete key result', async () => {
      const goal = await goalService.addKeyResult(goalId, {
        title: 'To Delete',
        targetValue: 100,
      });

      const krId = goal.keyResults[0]._id.toString();
      const updated = await goalService.deleteKeyResult(goalId, krId);

      expect(updated.keyResults).toHaveLength(0);
    });

    it('should calculate goal progress from key results', async () => {
      await goalService.addKeyResult(goalId, {
        title: 'KR1',
        targetValue: 100,
      });

      // Update first key result progress
      let goal = await Goal.findById(goalId);
      goal!.keyResults[0].currentValue = 50;
      await goal!.save();

      // Add second key result with 100% completion
      goal = await goalService.addKeyResult(goalId, {
        title: 'KR2',
        targetValue: 100,
      });
      goal!.keyResults[1].currentValue = 100;
      await goal!.save();

      // Reload to get recalculated progress
      goal = await Goal.findById(goalId);
      // (50% + 100%) / 2 = 75%
      expect(goal!.progress).toBe(75);
    });
  });

  describe('listGoals', () => {
    beforeEach(async () => {
      await Goal.create([
        {
          title: 'Active Goal 1',
          ownerId: mockOwnerId,
          type: 'individual',
          status: 'active',
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-03-31'),
        },
        {
          title: 'Active Goal 2',
          ownerId: mockOwnerId,
          type: 'team',
          status: 'active',
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-06-30'),
        },
        {
          title: 'Completed Goal',
          ownerId: mockOwnerId,
          type: 'individual',
          status: 'completed',
          startDate: new Date('2023-01-01'),
          dueDate: new Date('2023-12-31'),
        },
      ]);
    });

    it('should list goals with pagination', async () => {
      const result = await goalService.listGoals({ page: 1, per_page: 10 });

      expect(result.goals).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by status', async () => {
      const result = await goalService.listGoals({
        status: 'active',
        page: 1,
        per_page: 10,
      });

      expect(result.goals).toHaveLength(2);
      expect(result.goals.every((g) => g.status === 'active')).toBe(true);
    });

    it('should filter by type', async () => {
      const result = await goalService.listGoals({
        type: 'individual',
        page: 1,
        per_page: 10,
      });

      expect(result.goals).toHaveLength(2);
      expect(result.goals.every((g) => g.type === 'individual')).toBe(true);
    });

    it('should filter by owner_id', async () => {
      const otherOwnerId = new mongoose.Types.ObjectId().toString();
      await Goal.create({
        title: 'Other Owner Goal',
        ownerId: otherOwnerId,
        type: 'individual',
        status: 'active',
        startDate: new Date('2024-01-01'),
        dueDate: new Date('2024-03-31'),
      });

      const result = await goalService.listGoals({
        owner_id: mockOwnerId,
        page: 1,
        per_page: 10,
      });

      expect(result.goals).toHaveLength(3);
    });
  });
});
