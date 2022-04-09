function integral=IntegralTrapezoidalRule(times,curve,F)
  N = size(times);
  integral=[curve(1,:)*0];
  
  for i=2:N(2)
    integral(i,:) = integral(i-1,:) + 0.5*(F(times(i),curve(i,:)) + F(times(i-1),curve(i-1,:)))*(times(i)-times(i-1));
  endfor
endfunction
