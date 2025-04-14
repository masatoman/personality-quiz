import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from '../FormInput';

describe('FormInput', () => {
  const defaultProps = {
    label: 'テスト入力',
    name: 'test-input',
  };

  it('基本的なレンダリングが正しく行われる', () => {
    render(<FormInput {...defaultProps} />);
    
    expect(screen.getByLabelText('テスト入力')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'test-input');
  });

  it('必須フィールドの場合、アスタリスクが表示される', () => {
    render(<FormInput {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('入力変更時にonChangeが呼ばれる', () => {
    const handleChange = jest.fn() as jest.MockedFunction<(e: React.ChangeEvent<HTMLInputElement>) => void>;
    render(<FormInput {...defaultProps} onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'テストテキスト' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('テストテキスト');
  });

  describe('バリデーション', () => {
    const validation = {
      required: { value: true, message: '入力は必須です' },
      minLength: { value: 5, message: '5文字以上で入力してください' },
      maxLength: { value: 10, message: '10文字以下で入力してください' },
      pattern: { value: /^[A-Za-z]+$/, message: '英字のみ使用可能です' },
      custom: [
        {
          test: (value: string) => !value.includes('test'),
          message: 'testという文字列は使用できません',
        },
      ],
    };

    it('必須バリデーションが正しく動作する - onChange', () => {
      const onValidationChange = jest.fn() as jest.MockedFunction<(isValid: boolean) => void>;
      render(
        <FormInput
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
          onValidationChange={onValidationChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // 無効な入力（空）
      fireEvent.change(input, { target: { value: '' } });
      expect(screen.getByText('入力は必須です')).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
      
      // 有効な入力
      fireEvent.change(input, { target: { value: 'valid' } });
      expect(screen.queryByText('入力は必須です')).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it('最小文字数バリデーションが正しく動作する', () => {
      render(
        <FormInput
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'abc' } });
      
      expect(screen.getByText('5文字以上で入力してください')).toBeInTheDocument();
    });

    it('最大文字数バリデーションが正しく動作する', () => {
      render(
        <FormInput
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'abcdefghijk' } });
      
      expect(screen.getByText('10文字以下で入力してください')).toBeInTheDocument();
    });

    it('パターンバリデーションが正しく動作する', () => {
      render(
        <FormInput
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'abc123' } });
      
      expect(screen.getByText('英字のみ使用可能です')).toBeInTheDocument();
    });

    it('カスタムバリデーションが正しく動作する', () => {
      render(
        <FormInput
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(screen.getByText('testという文字列は使用できません')).toBeInTheDocument();
    });

    it('onBlur時のバリデーションが正しく動作する', () => {
      const onValidationChange = jest.fn() as jest.MockedFunction<(isValid: boolean) => void>;
      render(
        <FormInput
          {...defaultProps}
          validation={validation}
          validationTrigger="onBlur"
          onValidationChange={onValidationChange}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // フォーカスを当てて外す
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(screen.getByText('入力は必須です')).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  it('外部から渡されたエラーメッセージが表示される', () => {
    render(
      <FormInput
        {...defaultProps}
        errorMessage="外部エラーメッセージ"
      />
    );
    
    expect(screen.getByText('外部エラーメッセージ')).toBeInTheDocument();
  });

  describe('パスワード入力', () => {
    it('パスワードの表示/非表示を切り替えられる', () => {
      render(
        <FormInput
          {...defaultProps}
          type="password"
        />
      );
      
      const input = screen.getByLabelText('テスト入力');
      expect(input).toHaveAttribute('type', 'password');
      
      // 表示切り替えボタンをクリック
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(input).toHaveAttribute('type', 'text');
      
      // もう一度クリックで非表示に戻る
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  it('バリデーションアイコンの表示を制御できる', () => {
    const { rerender } = render(
      <FormInput
        {...defaultProps}
        validation={{ required: { value: true, message: '必須です' } }}
        showValidationIcon={false}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    
    // アイコンが表示されないことを確認
    expect(document.querySelector('.fa-exclamation-circle')).not.toBeInTheDocument();
    expect(document.querySelector('.fa-check-circle')).not.toBeInTheDocument();
    
    // アイコン表示を有効にして再レンダリング
    rerender(
      <FormInput
        {...defaultProps}
        validation={{ required: { value: true, message: '必須です' } }}
        showValidationIcon={true}
      />
    );
    
    // エラーアイコンが表示されることを確認
    expect(document.querySelector('.fa-exclamation-circle')).toBeInTheDocument();
  });
}); 