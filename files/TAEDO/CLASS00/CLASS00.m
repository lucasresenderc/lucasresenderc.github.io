%{
	CLASS 00
	Here we implement a simple euler method to solve the
	logistic equation x' = x(1-x).
	The method is implemented on the file LOGISTICEUCLERMETHOD.m
	and called here
%}

# setting up the initial variables
t0 = 0;
x0 = 1;
dt = .1;
steps = 100;
c = 1;
X = 10;

# calling the method
[t,x] = LOGISTICEULERMETHOD(t0, x0, dt, steps, c, X);

# plotting
plot(
  t, x
)
xlabel("t");
ylabel("x(t)");
title("Solution of the Logistic Equation using Euler Method");
print("class00.pdf"); # this line saves the plot on the disk
