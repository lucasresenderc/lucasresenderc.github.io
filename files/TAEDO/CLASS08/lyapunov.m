options= odeset('Reltol',0.001,'Stats','off');

t0 = 0;
h = .01;
n = 10;
x0 = [1,1.3,2];
dx0 = [.1, .1, .1];
ts = linspace(t0, t0+h*(n-1), n);

sigma = 10
b = 8/3
rho = 28
F = @(t,x) [sigma*(x(2) - x(1)), x(1)*(rho - x(3)) - x(2), x(1)*x(2) - b*x(3)];

# we start finding a solution of 
# dx/dt = F(t,x) for the initial condition
[ts,solution] = ode45(F, ts, x0, options);

# start the pertubated solution
pertubated_solution = [x0+dx0];

lambda_sum = 0;
for i = 2:n
    [t, xs] = ode45(F, [ts(i-1), ts(i)], solution(i-1) + dx0, options);
    pertubated_solution(end+1) = xs(2);

    lambda_sum = lambda_sum + log(norm(xs(2) - solution(i))/norm(dx0));
    lambda = lambda_sum/(h*i)
endfor

