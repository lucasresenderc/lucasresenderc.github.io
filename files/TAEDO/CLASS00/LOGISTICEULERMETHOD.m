%{
	EULER METHOD FOR THE LOGISTIC EQUATION
	x' = x(1-x)
	
	The idea is to let x(t+h) = x(t) + x'(t)h
	
	This file is implements a function that will be called
	from another file. Therefore, the name of the function
	implemented here MUST be the same as the name of the
	file.
%}

function [t,x] = LOGISTICEULERMETHOD(t0, x0, dt, steps, c, X)
  t = [t0];
  x = [x0];
  
  for i=1:steps
    t(end+1) = t(end) + dt;
    x(end+1) = x(end) + c*x(end)*(1 - x(end)/X)*dt;
  end
end
