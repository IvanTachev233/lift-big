// src/components/WeekNavigator.tsx
import React from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  startOfToday,
} from 'date-fns';
import './WeekNavigator.css';

interface WeekNavigatorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  selectedDate,
  onDateSelect,
  weekStartsOn = 1, // Default to Monday as start of week
}) => {
  // State to manage the start date of the currently VISIBLE week
  // Initialize it based on the initially selected date
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(
    startOfWeek(selectedDate, { weekStartsOn })
  );

  // Update currentWeekStart if the selectedDate prop changes externally
  // and falls outside the currently displayed week
  React.useEffect(() => {
    const currentVisibleWeekStart = startOfWeek(selectedDate, { weekStartsOn });
    if (!isSameDay(currentVisibleWeekStart, currentWeekStart)) {
      setCurrentWeekStart(currentVisibleWeekStart);
    }
  }, [selectedDate, weekStartsOn]);

  const handleToday = () => {
    setCurrentWeekStart(() => startOfWeek(startOfToday(), { weekStartsOn }));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleDayClick = (day: Date) => {
    onDateSelect(day); // Call the parent's handler to update the main selectedDate
  };

  // Generate the days for the current week view
  const daysOfWeek = [];
  let dayPointer = currentWeekStart;
  for (let i = 0; i < 7; i++) {
    daysOfWeek.push(dayPointer);
    dayPointer = addDays(dayPointer, 1);
  }

  // Format the header display
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn });
  const weekHeaderFormat =
    format(currentWeekStart, 'MMM d') + ' - ' + format(weekEnd, 'MMM d, yyyy');

  return (
    <div className='week-navigator'>
      <div className='week-navigator-header'>
        <button onClick={handlePrevWeek} className='week-nav-button' aria-label='Previous week'>
          &lt;
        </button>
        <span className='week-navigator-title'>{weekHeaderFormat}</span>
        <div className='week-nav-button-group'>
          <button onClick={handleToday} className='week-nav-button today-button'>
            Today
          </button>
          <button onClick={handleNextWeek} className='week-nav-button' aria-label='Next week'>
            &gt;
          </button>
        </div>
      </div>
      <div className='week-navigator-days'>
        {daysOfWeek.map((day) => {
          const dayClasses = [
            'week-day',
            isSameDay(day, selectedDate) ? 'selected' : '',
            isToday(day) ? 'today' : '',
          ]
            .join(' ')
            .trim();

          return (
            <div
              key={day.toISOString()}
              className={dayClasses}
              onClick={() => handleDayClick(day)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleDayClick(day)}
            >
              <span className='day-name'>{format(day, 'EEE')}</span>
              <span className='day-number'>{format(day, 'd')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekNavigator;
