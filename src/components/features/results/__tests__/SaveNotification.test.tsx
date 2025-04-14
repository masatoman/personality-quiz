import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SaveNotification from '../SaveNotification';

describe('SaveNotification', () => {
  it('保存中の状態を表示する', () => {
    render(
      <SaveNotification
        savingResults={true}
        saveSuccess={false}
        saveError={null}
      />
    );
    expect(screen.getByText('保存中...')).toBeInTheDocument();
  });

  it('保存成功時のメッセージを表示する', () => {
    render(
      <SaveNotification
        savingResults={false}
        saveSuccess={true}
        saveError={null}
      />
    );
    expect(screen.getByText('結果を保存しました')).toBeInTheDocument();
  });

  it('エラーメッセージを表示する', () => {
    const errorMessage = '保存に失敗しました';
    render(
      <SaveNotification
        savingResults={false}
        saveSuccess={false}
        saveError={errorMessage}
      />
    );
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('状態がない場合は何も表示しない', () => {
    const { container } = render(
      <SaveNotification
        savingResults={false}
        saveSuccess={false}
        saveError={null}
      />
    );
    expect(container.firstChild).toBeNull();
  });
}); 