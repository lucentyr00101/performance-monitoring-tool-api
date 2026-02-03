import { describe, it, expect, beforeEach } from 'vitest';
import { reviewCycleService } from '@reviews/services/index.js';
import { ReviewCycle } from '@reviews/models/index.js';
import { Review } from '@reviews/models/index.js';
import { Types } from 'mongoose';

describe('ReviewCycleService', () => {
  const defaultPagination = {
    page: 1,
    perPage: 10,
    skip: 0,
    sortBy: 'startDate',
    sortOrder: 'desc',
  };

  describe('createReviewCycle', () => {
    it('should create a review cycle with valid data', async () => {
      const data = {
        name: 'Q1 2024 Review',
        description: 'Quarterly review for Q1',
        type: 'quarterly',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
      };

      const cycle = await reviewCycleService.createReviewCycle(data);

      expect(cycle).toBeDefined();
      expect(cycle.name).toBe(data.name);
      expect(cycle.type).toBe('quarterly');
      expect(cycle.status).toBe('draft');
    });

    it('should throw error if end date is before start date', async () => {
      const data = {
        name: 'Invalid Cycle',
        type: 'annual',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-01-01'),
      };

      await expect(reviewCycleService.createReviewCycle(data)).rejects.toThrow('End date must be after start date');
    });

    it('should create with custom settings', async () => {
      const data = {
        name: 'Custom Settings Cycle',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        settings: {
          selfReviewEnabled: false,
          peerReviewEnabled: true,
          requireCalibration: true,
        },
      };

      const cycle = await reviewCycleService.createReviewCycle(data);

      expect(cycle.settings?.selfReviewEnabled).toBe(false);
      expect(cycle.settings?.peerReviewEnabled).toBe(true);
      expect(cycle.settings?.requireCalibration).toBe(true);
    });
  });

  describe('listReviewCycles', () => {
    beforeEach(async () => {
      // Create test cycles
      await ReviewCycle.create([
        { name: 'Cycle 1', type: 'annual', status: 'draft', startDate: new Date('2024-01-01'), endDate: new Date('2024-12-31') },
        { name: 'Cycle 2', type: 'quarterly', status: 'active', startDate: new Date('2024-04-01'), endDate: new Date('2024-06-30') },
        { name: 'Cycle 3', type: 'annual', status: 'completed', startDate: new Date('2023-01-01'), endDate: new Date('2023-12-31') },
      ]);
    });

    it('should list all review cycles', async () => {
      const result = await reviewCycleService.listReviewCycles({}, defaultPagination);

      expect(result.cycles).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by status', async () => {
      const result = await reviewCycleService.listReviewCycles({ status: 'active' }, defaultPagination);

      expect(result.cycles).toHaveLength(1);
      expect(result.cycles[0].name).toBe('Cycle 2');
    });

    it('should filter by type', async () => {
      const result = await reviewCycleService.listReviewCycles({ type: 'annual' }, defaultPagination);

      expect(result.cycles).toHaveLength(2);
    });

    it('should filter by year', async () => {
      const result = await reviewCycleService.listReviewCycles({ year: 2024 }, defaultPagination);

      expect(result.cycles).toHaveLength(2);
    });
  });

  describe('getReviewCycleById', () => {
    it('should get a review cycle by id', async () => {
      const created = await ReviewCycle.create({
        name: 'Test Cycle',
        type: 'semi_annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
      });

      const cycle = await reviewCycleService.getReviewCycleById(created._id.toString());

      expect(cycle).toBeDefined();
      expect(cycle.name).toBe('Test Cycle');
      expect(cycle.stats).toBeDefined();
    });

    it('should throw error if not found', async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(reviewCycleService.getReviewCycleById(fakeId)).rejects.toThrow('Review cycle not found');
    });

    it('should include review stats', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Stats Cycle',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      // Create some reviews
      await Review.create([
        { reviewCycleId: cycle._id, employeeId: new Types.ObjectId(), reviewerId: new Types.ObjectId(), reviewerType: 'manager', status: 'pending' },
        { reviewCycleId: cycle._id, employeeId: new Types.ObjectId(), reviewerId: new Types.ObjectId(), reviewerType: 'self', status: 'submitted' },
      ]);

      const result = await reviewCycleService.getReviewCycleById(cycle._id.toString());

      expect(result.stats).toBeDefined();
    });
  });

  describe('updateReviewCycle', () => {
    it('should update a draft review cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Original Name',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft',
      });

      const updated = await reviewCycleService.updateReviewCycle(cycle._id.toString(), { name: 'Updated Name' });

      expect(updated.name).toBe('Updated Name');
    });

    it('should not allow updating completed cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Completed Cycle',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'completed',
      });

      await expect(
        reviewCycleService.updateReviewCycle(cycle._id.toString(), { name: 'Try Update' })
      ).rejects.toThrow('Cannot update a completed or cancelled review cycle');
    });

    it('should throw error if not found', async () => {
      const fakeId = new Types.ObjectId().toString();

      await expect(reviewCycleService.updateReviewCycle(fakeId, { name: 'Test' })).rejects.toThrow('Review cycle not found');
    });
  });

  describe('deleteReviewCycle', () => {
    it('should delete a draft cycle with no reviews', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Delete Me',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft',
      });

      await reviewCycleService.deleteReviewCycle(cycle._id.toString());

      const found = await ReviewCycle.findById(cycle._id);
      expect(found).toBeNull();
    });

    it('should not allow deleting active cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Active Cycle',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
      });

      await expect(reviewCycleService.deleteReviewCycle(cycle._id.toString())).rejects.toThrow('Cannot delete an active review cycle');
    });

    it('should not allow deleting cycle with reviews', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Has Reviews',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft',
      });

      await Review.create({
        reviewCycleId: cycle._id,
        employeeId: new Types.ObjectId(),
        reviewerId: new Types.ObjectId(),
        reviewerType: 'manager',
        status: 'pending',
      });

      await expect(reviewCycleService.deleteReviewCycle(cycle._id.toString())).rejects.toThrow('Cannot delete review cycle with existing reviews');
    });
  });

  describe('launchReviewCycle', () => {
    it('should launch a draft cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Launch Me',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft',
      });

      const launched = await reviewCycleService.launchReviewCycle(cycle._id.toString());

      expect(launched.status).toBe('active');
      expect(launched.launchedAt).toBeDefined();
    });

    it('should not launch already active cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Already Active',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
      });

      await expect(reviewCycleService.launchReviewCycle(cycle._id.toString())).rejects.toThrow('Cannot launch review cycle with status: active');
    });
  });

  describe('completeReviewCycle', () => {
    it('should complete an active cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Complete Me',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
      });

      const completed = await reviewCycleService.completeReviewCycle(cycle._id.toString());

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeDefined();
    });

    it('should not complete non-active cycle', async () => {
      const cycle = await ReviewCycle.create({
        name: 'Draft Cycle',
        type: 'annual',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'draft',
      });

      await expect(reviewCycleService.completeReviewCycle(cycle._id.toString())).rejects.toThrow('Only active review cycles can be completed');
    });
  });
});
