// src/components/ExerciseCard.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  IconButton,
  Checkbox,
  Chip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Exercise, WorkoutSet } from '../types';

// Weight mode types
export type WeightMode = 'EX' | 'PC' | 'RP';

export interface WeightModeOption {
  value: WeightMode;
  label: string;
  shortLabel: string;
}

export const WEIGHT_MODE_OPTIONS: WeightModeOption[] = [
  { value: 'EX', label: 'Exact Weight (kg)', shortLabel: 'kg' },
  { value: 'PC', label: '% of 1RM', shortLabel: '%1RM' },
  { value: 'RP', label: 'RPE', shortLabel: 'RPE' },
];

// Template set interface (for template mode)
export interface TemplateSet {
  id: string;
  setNumber: number;
  reps: number;
  expectedWeight: string;
  isCompleted: boolean;
}

// Base props for the component
interface BaseExerciseCardProps {
  exercise: Exercise;
  recentResults?: WorkoutSet[];
  onRemove?: () => void;
  // Reorder props (optional)
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

// Template mode props
interface TemplateExerciseCardProps extends BaseExerciseCardProps {
  mode: 'template';
  sets: TemplateSet[];
  weightMode: WeightMode;
  onWeightModeChange: (mode: WeightMode) => void;
  onAddSet: () => void;
  onRemoveSet: () => void;
  onSetFieldChange: (
    setId: string,
    field: 'reps' | 'expectedWeight' | 'isCompleted',
    value: number | string | boolean
  ) => void;
}

// Logging mode props
interface LoggingExerciseCardProps extends BaseExerciseCardProps {
  mode: 'logging';
  sets: WorkoutSet[];
  onAddSet: (reps: number, weight: number) => Promise<void>;
  onUpdateSet: (setId: number, reps: number, weight: number) => Promise<void>;
}

type ExerciseCardProps = TemplateExerciseCardProps | LoggingExerciseCardProps;

const ExerciseCard: React.FC<ExerciseCardProps> = (props) => {
  const {
    exercise,
    recentResults = [],
    onRemove,
    onMoveUp,
    onMoveDown,
    isFirst = true,
    isLast = true,
    mode,
    sets,
  } = props;

  const [weightModeAnchor, setWeightModeAnchor] = useState<null | HTMLElement>(null);

  // Logging mode local state
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [adding, setAdding] = useState(false);

  const showReorderButtons = onMoveUp && onMoveDown;

  const getExpectedWeightPlaceholder = () => {
    if (mode !== 'template') return '';
    switch (props.weightMode) {
      case 'PC':
        return 'e.g. 75';
      case 'RP':
        return 'e.g. 8';
      case 'EX':
      default:
        return 'e.g. 100';
    }
  };

  const getCurrentWeightModeLabel = () => {
    if (mode !== 'template') return 'kg';
    const option = WEIGHT_MODE_OPTIONS.find((opt) => opt.value === props.weightMode);
    return option?.shortLabel || 'kg';
  };

  // Handle adding a set in logging mode
  const handleAddLoggingSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'logging') return;

    const repsNum = parseInt(newReps, 10);
    const weightNum = parseFloat(newWeight);

    if (isNaN(repsNum) || repsNum <= 0 || isNaN(weightNum) || weightNum < 0) {
      return;
    }

    setAdding(true);
    try {
      await props.onAddSet(repsNum, weightNum);
      setNewReps('');
      setNewWeight('');
    } finally {
      setAdding(false);
    }
  };

  // Handle updating a set in logging mode
  const handleUpdateLoggingSet = (
    setId: number,
    field: 'reps' | 'weight',
    value: string,
    currentReps: number,
    currentWeight: string
  ) => {
    if (mode !== 'logging') return;

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    if (field === 'reps' && numValue === currentReps) return;
    if (field === 'weight' && value === currentWeight) return;

    const finalReps = field === 'reps' ? parseInt(value, 10) : currentReps;
    const finalWeight = field === 'weight' ? parseFloat(value) : parseFloat(currentWeight);

    props.onUpdateSet(setId, finalReps, finalWeight);
  };

  return (
    <Card
      sx={{
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showReorderButtons && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <IconButton
                  onClick={onMoveUp}
                  size='small'
                  disabled={isFirst}
                  sx={{ p: 0.25 }}
                >
                  <KeyboardArrowUpIcon fontSize='small' />
                </IconButton>
                <IconButton
                  onClick={onMoveDown}
                  size='small'
                  disabled={isLast}
                  sx={{ p: 0.25 }}
                >
                  <KeyboardArrowDownIcon fontSize='small' />
                </IconButton>
              </Box>
            )}
            <Typography variant='h6' fontWeight='bold'>
              {exercise.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`${sets.length} sets`} size='small' variant='outlined' />
            {onRemove && (
              <IconButton onClick={onRemove} size='small' color='error'>
                <DeleteOutlineIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Recent Results Box */}
        {recentResults.length > 0 && (
          <Box
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
              Recent Results
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {recentResults.slice(0, 3).map((result, idx) => (
                <Chip
                  key={result.id || idx}
                  label={`${result.reps} reps x ${result.weight}kg`}
                  size='small'
                  variant='outlined'
                />
              ))}
            </Box>
          </Box>
        )}

        {recentResults.length === 0 && mode === 'template' && (
          <Box
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              No previous results for this exercise
            </Typography>
          </Box>
        )}

        {/* Column Headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: mode === 'template' ? '60px 80px 120px 80px' : '60px 1fr 1fr',
            gap: 1,
            mb: 1,
            px: 1,
          }}
        >
          <Typography variant='caption' color='text.secondary' fontWeight='bold'>
            Set
          </Typography>
          <Typography variant='caption' color='text.secondary' fontWeight='bold'>
            Reps
          </Typography>
          {mode === 'template' ? (
            <>
              <Box>
                <Button
                  size='small'
                  endIcon={<KeyboardArrowDownIcon />}
                  onClick={(e) => setWeightModeAnchor(e.currentTarget)}
                  sx={{
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                    fontSize: '0.75rem',
                  }}
                >
                  {getCurrentWeightModeLabel()}
                </Button>
                <Menu
                  anchorEl={weightModeAnchor}
                  open={Boolean(weightModeAnchor)}
                  onClose={() => setWeightModeAnchor(null)}
                >
                  {WEIGHT_MODE_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      selected={option.value === props.weightMode}
                      onClick={() => {
                        props.onWeightModeChange(option.value);
                        setWeightModeAnchor(null);
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Typography variant='caption' color='text.secondary' fontWeight='bold'>
                Done
              </Typography>
            </>
          ) : (
            <Typography variant='caption' color='text.secondary' fontWeight='bold'>
              Weight (kg)
            </Typography>
          )}
        </Box>

        {/* Sets Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {mode === 'template'
            ? // Template mode sets
              (sets as TemplateSet[]).map((set) => (
                <Box
                  key={set.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px 80px 120px 80px',
                    gap: 1,
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Typography variant='body2' fontWeight='medium'>
                    {set.setNumber}
                  </Typography>
                  <TextField
                    type='number'
                    size='small'
                    value={set.reps}
                    onChange={(e) =>
                      props.onSetFieldChange(set.id, 'reps', parseInt(e.target.value, 10) || 0)
                    }
                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                    sx={{ '& input': { py: 0.5 } }}
                  />
                  <TextField
                    type='number'
                    size='small'
                    value={set.expectedWeight}
                    onChange={(e) => props.onSetFieldChange(set.id, 'expectedWeight', e.target.value)}
                    placeholder={getExpectedWeightPlaceholder()}
                    inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center' } }}
                    sx={{ '& input': { py: 0.5 } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Checkbox
                      checked={set.isCompleted}
                      onChange={(e) => props.onSetFieldChange(set.id, 'isCompleted', e.target.checked)}
                      size='small'
                    />
                  </Box>
                </Box>
              ))
            : // Logging mode sets
              (sets as WorkoutSet[]).map((set, index) => (
                <Box
                  key={set.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 1fr',
                    gap: 1,
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  <Typography variant='body2' fontWeight='medium'>
                    {index + 1}
                  </Typography>
                  <TextField
                    type='number'
                    size='small'
                    defaultValue={set.reps}
                    onBlur={(e) =>
                      handleUpdateLoggingSet(set.id, 'reps', e.target.value, set.reps, set.weight)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                    sx={{ '& input': { py: 0.5 } }}
                  />
                  <TextField
                    type='number'
                    size='small'
                    defaultValue={set.weight}
                    onBlur={(e) =>
                      handleUpdateLoggingSet(set.id, 'weight', e.target.value, set.reps, set.weight)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center' } }}
                    sx={{ '& input': { py: 0.5 } }}
                  />
                </Box>
              ))}
        </Box>

        {/* Add Set Section */}
        {mode === 'template' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button
              variant='outlined'
              size='small'
              startIcon={<RemoveIcon />}
              onClick={props.onRemoveSet}
              disabled={sets.length <= 1}
            >
              Remove Set
            </Button>
            <Button variant='outlined' size='small' startIcon={<AddIcon />} onClick={props.onAddSet}>
              Add Set
            </Button>
          </Box>
        ) : (
          <Box
            component='form'
            onSubmit={handleAddLoggingSet}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: 1,
              mt: 2,
              alignItems: 'end',
            }}
          >
            <TextField
              type='number'
              size='small'
              label='Reps'
              value={newReps}
              onChange={(e) => setNewReps(e.target.value)}
              inputProps={{ min: 1 }}
              required
            />
            <TextField
              type='number'
              size='small'
              label='Weight (kg)'
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              inputProps={{ min: 0, step: 0.5 }}
              required
            />
            <Button type='submit' variant='contained' size='medium' disabled={adding}>
              {adding ? '...' : 'Add'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
