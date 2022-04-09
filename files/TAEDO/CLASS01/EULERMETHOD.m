%{
	EULER METHOD
	Take some F such that x' = F(t,x)
	and solve using the Euler Method
		x0 is the initial condition
		t0 is the initial time 
		dt is the timestep
		n  is the number of steps
%}

function [ts, xs] = EULERMETHOD(x0, t0, dt, n, F)
  ts = [t0];
  xs = [x0];
  
  for i=1:n
    x = xs(end, :);
    dx = F(ts(end), x);
    xs = [xs; x + dx'*dt ];
    ts(end+1) = ts(end)+dt;
  endfor
endfunction
