import React from 'react';
import ListGroup, { ListGroupProps } from 'react-bootstrap/ListGroup';

interface StyledListGroupProps extends ListGroupProps {
  children: React.ReactNode;
}

const StyledListGroup: React.FC<StyledListGroupProps> & {
  Item: typeof ListGroup.Item;
} = ({ children, className, ...props }) => {
  return (
    <ListGroup className={`styled-list-group ${className || ''}`} {...props}>
      {children}
    </ListGroup>
  );
};

StyledListGroup.Item = ListGroup.Item;

export default StyledListGroup;
