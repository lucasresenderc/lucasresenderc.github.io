function integral = IntegralSimpsonRule(times,curve,F)
  N = size(times);
  integral=[curve(1,:)*0];
  
  for i=2:N(2)
     integral(i,:) = integral(i-1,:) + (F(times(i),curve(i,:)) + 4*F((times(i)+times(i-1))/2,(curve(i,:)+curve(i-1,:))/2) + F(times(i-1),curve(i-1,:)))*(times(i)-times(i-1))/6;
  endfor
endfunction
