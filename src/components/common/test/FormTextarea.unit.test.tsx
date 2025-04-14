import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormTextarea from '../FormTextarea';

describe('FormTextarea', () => {
  const defaultProps = {
    label: 'テストテキストエリア',
    name: 'test-textarea',
  };

  it('基本的なレンダリングが正しく行われる', () => {
    render(<FormTextarea {...defaultProps} />);
    
    expect(screen.getByLabelText('テストテキストエリア')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'test-textarea');
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4'); // デフォルト値
  });

  it('必須フィールドの場合、アスタリスクが表示される', () => {
    render(<FormTextarea {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('入力変更時にonChangeが呼ばれる', () => {
    const handleChange = jest.fn() as jest.MockedFunction<(e: React.ChangeEvent<HTMLTextAreaElement>) => void>;
    render(<FormTextarea {...defaultProps} onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'テストテキスト' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('テストテキスト');
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
        <FormTextarea
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
          onValidationChange={onValidationChange}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // 無効な入力（空）
      fireEvent.change(textarea, { target: { value: '' } });
      expect(screen.getByText('入力は必須です')).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
      
      // 有効な入力
      fireEvent.change(textarea, { target: { value: 'valid' } });
      expect(screen.queryByText('入力は必須です')).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it('最小文字数バリデーションが正しく動作する', () => {
      render(
        <FormTextarea
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'abc' } });
      
      expect(screen.getByText('5文字以上で入力してください')).toBeInTheDocument();
    });

    it('最大文字数バリデーションが正しく動作する', () => {
      render(
        <FormTextarea
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'abcdefghijk' } });
      
      expect(screen.getByText('10文字以下で入力してください')).toBeInTheDocument();
    });

    it('パターンバリデーションが正しく動作する', () => {
      render(
        <FormTextarea
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'abc123' } });
      
      expect(screen.getByText('英字のみ使用可能です')).toBeInTheDocument();
    });

    it('カスタムバリデーションが正しく動作する', () => {
      render(
        <FormTextarea
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'test' } });
      
      expect(screen.getByText('testという文字列は使用できません')).toBeInTheDocument();
    });

    it('onBlur時のバリデーションが正しく動作する', () => {
      const onValidationChange = jest.fn() as jest.MockedFunction<(isValid: boolean) => void>;
      render(
        <FormTextarea
          {...defaultProps}
          validation={validation}
          validationTrigger="onBlur"
          onValidationChange={onValidationChange}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      
      // フォーカスを当てて外す
      fireEvent.focus(textarea);
      fireEvent.blur(textarea);
      
      expect(screen.getByText('入力は必須です')).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  it('外部から渡されたエラーメッセージが表示される', () => {
    render(
      <FormTextarea
        {...defaultProps}
        errorMessage="外部エラーメッセージ"
      />
    );
    
    expect(screen.getByText('外部エラーメッセージ')).toBeInTheDocument();
  });

  it('文字数カウントが正しく表示される', () => {
    render(
      <FormTextarea
        {...defaultProps}
        showCharCount
        maxLength={100}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'テストテキスト' } });
    
    expect(screen.getByText('6 / 100')).toBeInTheDocument();
  });

  it('バリデーションアイコンの表示を制御できる', () => {
    const { rerender } = render(
      <FormTextarea
        {...defaultProps}
        validation={{ required: { value: true, message: '必須です' } }}
        showValidationIcon={false}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });
    fireEvent.blur(textarea);
    
    // アイコンが表示されないことを確認
    expect(document.querySelector('.fa-exclamation-circle')).not.toBeInTheDocument();
    expect(document.querySelector('.fa-check-circle')).not.toBeInTheDocument();
    
    // アイコン表示を有効にして再レンダリング
    rerender(
      <FormTextarea
        {...defaultProps}
        validation={{ required: { value: true, message: '必須です' } }}
        showValidationIcon={true}
      />
    );
    
    // エラーアイコンが表示されることを確認
    expect(document.querySelector('.fa-exclamation-circle')).toBeInTheDocument();
  });
}); 