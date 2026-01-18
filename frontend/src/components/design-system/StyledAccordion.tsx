import React from 'react';
import Accordion, { AccordionProps } from 'react-bootstrap/Accordion';

interface StyledAccordionProps extends AccordionProps {
  children: React.ReactNode;
}

const StyledAccordion: React.FC<StyledAccordionProps> & {
  Item: typeof Accordion.Item;
  Header: typeof Accordion.Header;
  Body: typeof Accordion.Body;
} = ({ children, className, ...props }) => {
  return (
    <Accordion className={`styled-accordion ${className || ''}`} {...props}>
      {children}
    </Accordion>
  );
};

StyledAccordion.Item = Accordion.Item;
StyledAccordion.Header = Accordion.Header;
StyledAccordion.Body = Accordion.Body;

export default StyledAccordion;
