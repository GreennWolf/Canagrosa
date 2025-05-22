import React from 'react';
import AdvancedSampleTable from './AdvancedSampleTable';

/**
 * Componente simple que envuelve AdvancedSampleTable
 * Mantiene consistencia con la estructura de otros módulos
 */
const SampleTable = (props) => {
  return <AdvancedSampleTable {...props} />;
};

export default SampleTable;