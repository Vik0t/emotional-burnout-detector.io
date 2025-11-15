import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
} from '../context-menu';

describe('ContextMenu', () => {
  test('opens on right-click and clicking item triggers and closes', async () => {
    const onClick = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button data-testid="trigger">Open</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuItem onClick={onClick}>Two</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');
    // right-click
    fireEvent.contextMenu(trigger);
    const menu = await screen.findByRole('menu');
    expect(menu).toBeTruthy();

    // Item is visible
    expect(screen.getByText('One')).toBeTruthy();

    // Click second item
    await userEvent.click(screen.getByText('Two'));
    expect(onClick).toHaveBeenCalled();

    // Menu should be closed
    expect(screen.queryByRole('menu')).toBeNull();
  });

  test('opens via keyboard and navigates with arrows + Enter', async () => {
    const onClick = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button data-testid="trigger">Open</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>One</ContextMenuItem>
          <ContextMenuItem onClick={onClick}>Two</ContextMenuItem>
          <ContextMenuItem>Three</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    const trigger = screen.getByTestId('trigger');

    // Focus then open with keyboard ContextMenu or Shift+F10
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ContextMenu' });
    const menu = await screen.findByRole('menu');

    expect(menu).toBeTruthy();

    // After open, first item should be focused
    expect(document.activeElement?.textContent).toBe('One');

    // Arrow down moves to next item
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement?.textContent).toBe('Two');

    // Enter triggers click on focused item
    fireEvent.keyDown(menu, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();

    // Menu should be closed
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
