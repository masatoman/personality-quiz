import { PointsSystem } from '../types/PointsSystem';
import { ACTIVITY_POINTS } from '../constants/points';

describe('PointsSystem', () => {
  let pointsSystem: PointsSystem;

  beforeEach(() => {
    pointsSystem = new PointsSystem();
  });

  test('calculatePoints returns correct points for activities', () => {
    expect(pointsSystem.calculatePoints('CREATE_CONTENT')).toBe(ACTIVITY_POINTS.CREATE_CONTENT);
    expect(pointsSystem.calculatePoints('PROVIDE_FEEDBACK')).toBe(ACTIVITY_POINTS.PROVIDE_FEEDBACK);
    expect(pointsSystem.calculatePoints('COMPLETE_RESOURCE')).toBe(ACTIVITY_POINTS.COMPLETE_RESOURCE);
  });

  test('getTotalPoints returns initial value of 0', () => {
    expect(pointsSystem.getTotalPoints()).toBe(0);
  });

  test('addPoints increases total points', () => {
    pointsSystem.addPoints(10);
    expect(pointsSystem.getTotalPoints()).toBe(10);

    pointsSystem.addPoints(5);
    expect(pointsSystem.getTotalPoints()).toBe(15);
  });

  test('full workflow of earning points', () => {
    const createPoints = pointsSystem.calculatePoints('CREATE_CONTENT');
    pointsSystem.addPoints(createPoints);
    expect(pointsSystem.getTotalPoints()).toBe(ACTIVITY_POINTS.CREATE_CONTENT);

    const feedbackPoints = pointsSystem.calculatePoints('PROVIDE_FEEDBACK');
    pointsSystem.addPoints(feedbackPoints);
    expect(pointsSystem.getTotalPoints()).toBe(ACTIVITY_POINTS.CREATE_CONTENT + ACTIVITY_POINTS.PROVIDE_FEEDBACK);
  });
}); 