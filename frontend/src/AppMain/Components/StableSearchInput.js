import React, { useState, useRef, useCallback } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// 稳定的搜索输入组件，防止失去焦点
const StableSearchInput = ({ onSearch, placeholder = "搜索..." }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const latestValueRef = useRef('');

  // 使用 useCallback 确保函数引用稳定
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    latestValueRef.current = newValue;
    setValue(newValue);
  }, []);

  const handleSearch = useCallback(() => {
    onSearch(latestValueRef.current || '');
  }, [onSearch]);

  // 处理回车键搜索
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyPress}  // 使用 onKeyDown 替代 onKeyPress，更好的兼容性
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton 
              onClick={handleSearch} 
              edge="end"
              onMouseDown={(e) => e.preventDefault()} // 防止点击按钮时失去焦点
            >
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      inputRef={inputRef} // 使组件可以访问底层输入元素
      autoComplete="off"  // 禁用自动填充，避免移动端干扰
      autoCapitalize="off" // 禁用自动大写
      autoCorrect="off"    // 禁用自动纠错
      spellCheck="false"   // 禁用拼写检查
    />
  );
};

export default StableSearchInput;