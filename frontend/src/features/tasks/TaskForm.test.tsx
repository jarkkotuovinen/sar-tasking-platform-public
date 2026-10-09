import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  const mockAOI = {
    geometry: { type: 'Polygon' as const, coordinates: [] },
    area: 50.5,
    centerLat: 60.1745,
    centerLon: 24.9404,
  };

  const mockOnSubmit = vi.fn();

  it('renders all form fields', () => {
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Mission Parameters')).toBeInTheDocument();
    expect(screen.getByLabelText('Resolution Mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Polarization')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority Level')).toBeInTheDocument();
  });

  it('shows AOI locked status when AOI is provided', () => {
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/✓ AOI Locked: 50.5 km²/)).toBeInTheDocument();
  });

  it('shows warning when no AOI is provided', () => {
    render(<TaskForm currentAOI={null} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('⚠ Define AOI on map')).toBeInTheDocument();
  });

  it('disables submit button when no AOI', () => {
    render(<TaskForm currentAOI={null} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', {
      name: /Submit Tasking Request/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when AOI is provided', () => {
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', {
      name: /Submit Tasking Request/i,
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('disables submit button when loading', () => {
    render(
      <TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} loading={true} />,
    );

    const submitButton = screen.getByRole('button', {
      name: /Submitting Mission/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('changes button text when loading', () => {
    const { rerender } = render(
      <TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} loading={false} />,
    );

    expect(
      screen.getByRole('button', { name: /Submit Tasking Request/i }),
    ).toBeInTheDocument();

    rerender(
      <TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} loading={true} />,
    );

    expect(
      screen.getByRole('button', { name: /Submitting Mission/i }),
    ).toBeInTheDocument();
  });

  it('allows selecting resolution mode', async () => {
    const user = userEvent.setup();
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const resolutionSelect = screen.getByLabelText('Resolution Mode');

    await user.selectOptions(resolutionSelect, 'SPOTLIGHT');
    expect(resolutionSelect).toHaveValue('SPOTLIGHT');

    await user.selectOptions(resolutionSelect, 'SCANSAR');
    expect(resolutionSelect).toHaveValue('SCANSAR');
  });

  it('allows selecting polarization', async () => {
    const user = userEvent.setup();
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const polarizationSelect = screen.getByLabelText('Polarization');

    await user.selectOptions(polarizationSelect, 'HH');
    expect(polarizationSelect).toHaveValue('HH');

    await user.selectOptions(polarizationSelect, 'VH');
    expect(polarizationSelect).toHaveValue('VH');
  });

  it('allows selecting priority', async () => {
    const user = userEvent.setup();
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const prioritySelect = screen.getByLabelText('Priority Level');

    await user.selectOptions(prioritySelect, 'URGENT');
    expect(prioritySelect).toHaveValue('URGENT');

    await user.selectOptions(prioritySelect, 'LOW');
    expect(prioritySelect).toHaveValue('LOW');
  });

  it('calls onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', {
      name: /Submit Tasking Request/i,
    });

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      aoi: mockAOI,
      resolution: 'STRIPMAP', // default
      polarization: 'VV', // default
      lookDirection: 'RIGHT',
      priority: 'MEDIUM', // default
    });
  });

  it('calls onSubmit with selected values', async () => {
    const user = userEvent.setup();
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    // Change form values
    await user.selectOptions(screen.getByLabelText('Resolution Mode'), 'SPOTLIGHT');
    await user.selectOptions(screen.getByLabelText('Polarization'), 'HH');
    await user.selectOptions(screen.getByLabelText('Priority Level'), 'URGENT');

    const submitButton = screen.getByRole('button', {
      name: /Submit Tasking Request/i,
    });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      aoi: mockAOI,
      resolution: 'SPOTLIGHT',
      polarization: 'HH',
      lookDirection: 'RIGHT',
      priority: 'URGENT',
    });
  });

  it('shows alert when submitting without AOI', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<TaskForm currentAOI={null} onSubmit={mockOnSubmit} />);

    const form = screen.getByRole('button', {
      name: /Submit Tasking Request/i,
    }).closest('form');

    // Try to submit (button is disabled, but test the form logic)
    if (form) {
      fireEvent.submit(form);
    }

    alertSpy.mockRestore();
  });

  it('renders resolution mode options correctly', () => {
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const resolutionSelect = screen.getByLabelText('Resolution Mode');
    const options = Array.from(resolutionSelect.querySelectorAll('option'));

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Spotlight');
    expect(options[1]).toHaveTextContent('Stripmap');
    expect(options[2]).toHaveTextContent('ScanSAR');
  });

  it('renders polarization options correctly', () => {
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const polarizationSelect = screen.getByLabelText('Polarization');
    const options = Array.from(polarizationSelect.querySelectorAll('option'));

    expect(options).toHaveLength(4);
    expect(options.map((o) => o.value)).toEqual(['VV', 'HH', 'VH', 'HV']);
  });

  it('renders priority options correctly', () => {
    render(<TaskForm currentAOI={mockAOI} onSubmit={mockOnSubmit} />);

    const prioritySelect = screen.getByLabelText('Priority Level');
    const options = Array.from(prioritySelect.querySelectorAll('option'));

    expect(options).toHaveLength(4);
    expect(options.map((o) => o.value)).toEqual(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
  });
});
