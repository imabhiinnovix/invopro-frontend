/**
 * Button Usage Examples
 * 
 * This file demonstrates how to use the standardized button components.
 * You can use this as a reference when implementing buttons in your features.
 * 
 * IMPORTANT: This is an example file - do not import from this file in production code.
 * Import StyledButton, PrimaryButton, or SecondaryButton directly instead.
 */

import React from 'react';
import { Box, Stack } from '@mui/material';
import { StyledButton } from './StyledButton';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

export const ButtonExamples = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      <h2>Button Examples</h2>
      
      {/* Basic Buttons */}
      <section style={{ marginBottom: 32 }}>
        <h3>Basic Buttons</h3>
        <Stack direction="row" spacing={2}>
          <StyledButton variant="primary">
            Primary Button
          </StyledButton>
          <StyledButton variant="secondary">
            Secondary Button
          </StyledButton>
        </Stack>
      </section>

      {/* Buttons with Icons */}
      <section style={{ marginBottom: 32 }}>
        <h3>Buttons with Icons</h3>
        <Stack direction="row" spacing={2}>
          <StyledButton variant="primary" icon={<SaveIcon />}>
            Save Dashboard
          </StyledButton>
          <StyledButton variant="secondary" icon={<AddIcon />}>
            Add Widget
          </StyledButton>
        </Stack>
      </section>

      {/* Common Action Buttons */}
      <section style={{ marginBottom: 32 }}>
        <h3>Common Actions</h3>
        <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
          <StyledButton variant="primary" icon={<SaveIcon />}>
            Save
          </StyledButton>
          <StyledButton variant="secondary" icon={<CloseIcon />}>
            Cancel
          </StyledButton>
          <StyledButton variant="primary" icon={<CheckIcon />}>
            Confirm
          </StyledButton>
          <StyledButton variant="secondary" icon={<EditOutlined sx={{ fontSize: "16px" }} />}>
            Edit
          </StyledButton>
          <StyledButton variant="primary" icon={<DeleteOutlined />}>
            Delete
          </StyledButton>
        </Stack>
      </section>

      {/* Disabled Buttons */}
      <section style={{ marginBottom: 32 }}>
        <h3>Disabled Buttons</h3>
        <Stack direction="row" spacing={2}>
          <StyledButton variant="primary" disabled>
            Disabled Primary
          </StyledButton>
          <StyledButton variant="secondary" disabled>
            Disabled Secondary
          </StyledButton>
        </Stack>
      </section>

      {/* Loading State Example */}
      <section style={{ marginBottom: 32 }}>
        <h3>Loading State</h3>
        <Stack direction="row" spacing={2}>
          <StyledButton variant="primary" disabled icon={<SaveIcon />}>
            Saving...
          </StyledButton>
          <StyledButton variant="secondary" disabled>
            Loading...
          </StyledButton>
        </Stack>
      </section>

      {/* Full Width Buttons */}
      <section style={{ marginBottom: 32 }}>
        <h3>Full Width Buttons</h3>
        <Stack spacing={2}>
          <StyledButton variant="primary" fullWidth icon={<SaveIcon />}>
            Save Changes
          </StyledButton>
          <StyledButton variant="secondary" fullWidth icon={<CloseIcon />}>
            Cancel
          </StyledButton>
        </Stack>
      </section>

      {/* Button Sizes (Custom) */}
      <section style={{ marginBottom: 32 }}>
        <h3>Custom Sizes</h3>
        <Stack direction="row" spacing={2} alignItems="center">
          <StyledButton variant="primary" sx={{ padding: '6px 16px', fontSize: '0.875rem' }}>
            Small
          </StyledButton>
          <StyledButton variant="primary">
            Medium (Default)
          </StyledButton>
          <StyledButton variant="primary" sx={{ padding: '14px 32px', fontSize: '1.125rem' }}>
            Large
          </StyledButton>
        </Stack>
      </section>

      {/* Dialog Actions Pattern */}
      <section style={{ marginBottom: 32 }}>
        <h3>Dialog Actions Pattern</h3>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <StyledButton variant="secondary">
            Cancel
          </StyledButton>
          <StyledButton variant="primary" icon={<SaveIcon />}>
            Save Changes
          </StyledButton>
        </Stack>
      </section>

      {/* Form Actions Pattern */}
      <section style={{ marginBottom: 32 }}>
        <h3>Form Actions Pattern</h3>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <StyledButton variant="secondary">
            Back
          </StyledButton>
          <Stack direction="row" spacing={2}>
            <StyledButton variant="secondary">
              Save Draft
            </StyledButton>
            <StyledButton variant="primary" icon={<CheckIcon />}>
              Submit
            </StyledButton>
          </Stack>
        </Stack>
      </section>
    </Box>
  );
};

export default ButtonExamples;
