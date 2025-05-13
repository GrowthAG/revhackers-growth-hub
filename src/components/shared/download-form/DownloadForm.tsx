
import React from 'react';
import { DownloadFormProps } from './types';
import { useDownloadForm } from './hooks/useDownloadForm';
import DownloadFormContent from './DownloadFormContent';

const DownloadForm = ({ materialId, materialType, onSubmit, linkMaterial }: DownloadFormProps) => {
  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    handleRadioChange,
    handleCheckboxChange,
    handleSubmit
  } = useDownloadForm(materialId, materialType, onSubmit, linkMaterial);

  return (
    <DownloadFormContent
      formData={formData}
      isSubmitting={isSubmitting}
      handleInputChange={handleInputChange}
      handleSelectChange={handleSelectChange}
      handleRadioChange={handleRadioChange}
      handleCheckboxChange={handleCheckboxChange}
      handleSubmit={handleSubmit}
    />
  );
};

export default DownloadForm;
