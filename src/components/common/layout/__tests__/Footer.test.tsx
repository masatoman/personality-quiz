import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer';

describe('Footer', () => {
  it('コピーライトテキストを表示する', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2024 ShiftWith\. All rights reserved\./)).toBeInTheDocument();
  });

  it('フッターリンクを表示する', () => {
    render(<Footer />);
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('利用規約')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
  });

  it('ソーシャルメディアリンクを表示する', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
  });
}); 