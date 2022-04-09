function integral = IntegralRectangleRule(times,curve,F)
  N = size(times);
  integral=[curve(1,:)*0];
  
  for i = 2:N(2)
    integral(i,:)= integral(i-1,:) + F(times(i),curve(i,:))*(times(i)-times(i-1));
  endfor
endfunction
