%{
	CLASS 01
	Solves the Lotka-Volterra equation using the Euler Method.
	The Euler Method was implemented on another file and can be
	used with any function F such that x' = F(t,x).
	Here we solve the following:
		x1' = x1*c1*(1 - a11*x1 - a12*x2)
		x2' = x2*c2*(1 - a21*x1 - a22*x2)
%}

# setting up the initial variables
t0 = 0;
x0 = [1.15,.15];
dt = 0.01;
n = 1000;

# defining the function F(t,x)
function dx = F(t,x)
  c = [-1, 1];
  A = [0, 1; 1, 0];
  dx = [
    x(1)*c(1)*(1 - A(1,1)*x(1) - A(1,2)*x(2)),
    x(2)*c(2)*(1 - A(2,1)*x(1) - A(2,2)*x(2))
  ];
endfunction

# calling the method
[ts, xs] = EULERMETHOD(x0, t0, dt, n, @F);

# plotting the phase space
plot(xs(:,1), xs(:,2))
xlabel("species 1");
ylabel("species 2");
title("Solution of the Lotka-Volterra equation using the Euler Method");
print("class01.pdf"); # this line saves the plot on the disk
