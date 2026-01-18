import React from 'react';
import './ListGroup.css';

interface ListGroupProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'flush' | 'default';
}

interface ListGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  action?: boolean;
  onClick?: () => void;
}

const ListGroupItem: React.FC<ListGroupItemProps> = ({
  children,
  className = '',
  active = false,
  action = false,
  onClick,
  ...props
}) => {
  const classes = [
    'ds-list-group-item',
    active ? 'active' : '',
    action || onClick ? 'ds-list-group-item-action' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined} {...props}>
      {children}
    </div>
  );
};

const ListGroup: React.FC<ListGroupProps> & { Item: typeof ListGroupItem } = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const classes = ['ds-list-group', variant === 'flush' ? 'ds-list-group-flush' : '', className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

ListGroup.Item = ListGroupItem;

export default ListGroup;
