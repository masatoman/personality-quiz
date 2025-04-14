import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FormSelect from '../FormSelect';

describe('FormSelect', () => {
  const defaultOptions = [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' },
  ];

  const defaultProps = {
    label: 'テスト選択',
    name: 'test-select',
    options: defaultOptions,
  };

  it('基本的なレンダリングが正しく行われる', () => {
    render(<FormSelect {...defaultProps} />);
    
    expect(screen.getByLabelText('テスト選択')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('name', 'test-select');
    
    // デフォルトオプションが表示される
    expect(screen.getByText('選択してください')).toBeInTheDocument();
    
    // すべてのオプションが表示される
    defaultOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('必須フィールドの場合、アスタリスクが表示される', () => {
    render(<FormSelect {...defaultProps} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('選択変更時にonChangeが呼ばれる', () => {
    const handleChange = jest.fn() as jest.MockedFunction<(value: string) => void>;
    render(<FormSelect {...defaultProps} onChange={handleChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option1' } });
    
    expect(handleChange).toHaveBeenCalledWith('option1');
    expect(select).toHaveValue('option1');
  });

  describe('バリデーション', () => {
    const validation = {
      required: { value: true, message: '選択は必須です' },
    };

    it('必須バリデーションが正しく動作する - onChange', () => {
      const onValidationChange = jest.fn() as jest.MockedFunction<(isValid: boolean) => void>;
      render(
        <FormSelect
          {...defaultProps}
          validation={validation}
          validationTrigger="onChange"
          onValidationChange={onValidationChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      
      // 無効な選択（空）
      fireEvent.change(select, { target: { value: '' } });
      expect(screen.getByText('選択は必須です')).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
      
      // 有効な選択
      fireEvent.change(select, { target: { value: 'option1' } });
      expect(screen.queryByText('選択は必須です')).not.toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });

    it('onBlur時のバリデーションが正しく動作する', () => {
      const onValidationChange = jest.fn() as jest.MockedFunction<(isValid: boolean) => void>;
      render(
        <FormSelect
          {...defaultProps}
          validation={validation}
          validationTrigger="onBlur"
          onValidationChange={onValidationChange}
        />
      );
      
      const select = screen.getByRole('combobox');
      
      // フォーカスを当てて外す
      fireEvent.focus(select);
      fireEvent.blur(select);
      
      expect(screen.getByText('選択は必須です')).toBeInTheDocument();
      expect(onValidationChange).toHaveBeenCalledWith(false);
    });
  });

  it('外部から渡されたエラーメッセージが表示される', () => {
    render(
      <FormSelect
        {...defaultProps}
        errorMessage="外部エラーメッセージ"
      />
    );
    
    expect(screen.getByText('外部エラーメッセージ')).toBeInTheDocument();
  });

  it('バリデーションアイコンの表示を制御できる', () => {
    const { rerender } = render(
      <FormSelect
        {...defaultProps}
        validation={{ required: { value: true, message: '必須です' } }}
        showValidationIcon={false}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });
    fireEvent.blur(select);
    
    // アイコンが表示されないことを確認
    expect(document.querySelector('.fa-exclamation-circle')).not.toBeInTheDocument();
    expect(document.querySelector('.fa-check-circle')).not.toBeInTheDocument();
    
    // アイコン表示を有効にして再レンダリング
    rerender(
      <FormSelect
        {...defaultProps}
        validation={{ required: { value: true, message: '必須です' } }}
        showValidationIcon={true}
      />
    );
    
    // エラーアイコンが表示されることを確認
    expect(document.querySelector('.fa-exclamation-circle')).toBeInTheDocument();
  });

  it('外部から渡されたvalueの変更が反映される', () => {
    const { rerender } = render(
      <FormSelect
        {...defaultProps}
        value="option1"
      />
    );
    
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('option1');
    
    // valueを変更して再レンダリング
    rerender(
      <FormSelect
        {...defaultProps}
        value="option2"
      />
    );
    
    expect(select).toHaveValue('option2');
  });
}); 