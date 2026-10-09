import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { TaskList } from './TaskList';
import { mockTasks } from '../../test/mockData';

describe('TaskList', () => {
  it('renders empty state when no tasks', () => {
    render(<TaskList tasks={[]} />);

    expect(screen.getByText('No missions submitted')).toBeInTheDocument();
    expect(
      screen.getByText('Draw an AOI and submit your first tasking request'),
    ).toBeInTheDocument();
  });

  it('renders task count in header', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText(`Mission Queue (${mockTasks.length})`)).toBeInTheDocument();
  });

  it('renders all tasks', () => {
    render(<TaskList tasks={mockTasks} />);

    // Should render all task statuses
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('ACQUIRING')).toBeInTheDocument();
  });

  it('displays task details correctly', () => {
    render(<TaskList tasks={[mockTasks[0]]} />);

    // Check resolution mode
    expect(screen.getByText('STRIPMAP')).toBeInTheDocument();

    // Check area
    expect(screen.getByText('50.5 km²')).toBeInTheDocument();

    // Check priority (lowercase due to capitalize class)
    expect(screen.getByText('high')).toBeInTheDocument();

    // Check polarization
    expect(screen.getByText('VV')).toBeInTheDocument();
  });

  it('displays validation errors when present', () => {
    render(<TaskList tasks={[mockTasks[1]]} />);

    expect(screen.getByText('⚠ Warnings:')).toBeInTheDocument();
    expect(screen.getByText(/AOI too large for Spotlight mode/)).toBeInTheDocument();
  });

  it('does not display validation errors section when no errors', () => {
    render(<TaskList tasks={[mockTasks[0]]} />);

    expect(screen.queryByText('⚠ Warnings:')).not.toBeInTheDocument();
  });

  it('formats submission date correctly', () => {
    render(<TaskList tasks={[mockTasks[0]]} />);

    // Should display "Submitted: " text
    expect(screen.getByText(/Submitted:/)).toBeInTheDocument();
  });

  it('applies correct status colors', () => {
    const { container } = render(<TaskList tasks={mockTasks} />);

    // Status badges should have appropriate classes
    const completedBadge = screen.getByText('COMPLETED');
    expect(completedBadge).toHaveClass('text-emerald-300');

    const pendingBadge = screen.getByText('PENDING');
    expect(pendingBadge).toHaveClass('text-yellow-300');

    const acquiringBadge = screen.getByText('ACQUIRING');
    expect(acquiringBadge).toHaveClass('text-purple-300');
  });

  it('renders tasks in scrollable container', () => {
    const { container } = render(<TaskList tasks={mockTasks} />);

    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('renders task cards with hover effects', () => {
    const { container } = render(<TaskList tasks={[mockTasks[0]]} />);

    const taskCard = container.querySelector('.hover\\:border-cyan-500\\/50');
    expect(taskCard).toBeInTheDocument();
  });
});
