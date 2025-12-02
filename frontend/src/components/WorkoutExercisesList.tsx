import React, { useMemo } from 'react';
import { Workout, WorkoutSet, Exercise } from '../types';
import WorkoutExerciseItem from './WorkoutExerciseItem';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

interface WorkoutExercisesListProps {
  workout: Workout;
  additionalExercises?: Exercise[];
  onAddSet: (exerciseId: number, reps: number, weight: number) => Promise<any>;
  onUpdateSet: (setId: number, reps: number, weight: number) => Promise<void>;
}

const WorkoutExercisesList: React.FC<WorkoutExercisesListProps> = ({
  workout,
  additionalExercises = [],
  onAddSet,
  onUpdateSet,
}) => {
  // Group sets by exercise
  const exerciseGroups = useMemo(() => {
    const groups: Record<number, { exercise: Exercise; sets: WorkoutSet[] }> = {};

    // 1. Add groups for existing sets
    // Sort sets by ID to maintain order
    const sortedSets = [...workout.sets].sort((a, b) => a.id - b.id);

    sortedSets.forEach((set) => {
      const exId = set.exercise.id;
      if (!groups[exId]) {
        groups[exId] = {
          exercise: set.exercise,
          sets: [],
        };
      }
      groups[exId].sets.push(set);
    });

    // 2. Add groups for additional exercises (if not already present)
    additionalExercises.forEach((ex) => {
      if (!groups[ex.id]) {
        groups[ex.id] = {
          exercise: ex,
          sets: [],
        };
      }
    });

    return Object.values(groups);
  }, [workout.sets, additionalExercises]);

  if (exerciseGroups.length === 0) {
    return (
      <Card className='text-center p-4 text-muted'>
        No exercises logged yet. Start by adding an exercise above!
      </Card>
    );
  }

  return (
    <Accordion defaultActiveKey={['0']} alwaysOpen>
      {exerciseGroups.map((group) => (
        <WorkoutExerciseItem
          key={group.exercise.id}
          exercise={group.exercise}
          sets={group.sets}
          onAddSet={(reps, weight) => onAddSet(group.exercise.id, reps, weight)}
          onUpdateSet={onUpdateSet}
        />
      ))}
    </Accordion>
  );
};

export default WorkoutExercisesList;
