%{
	ASSIGNMENT : INTEGRATION RULES
%}


# drawing a curve
times = [10:.1:20];
curve = [sin(times); times .^2]';

# setting up a function F
function res = F(t,x)
  res = x;
endfunction

# calling the methods
IntegralRectangle = IntegralRectangleRule(times,curve,@F);
IntegralTrapezoidal = IntegralTrapezoidalRule(times,curve,@F);
IntegralSimpson = IntegralSimpsonRule(times,curve,@F);

# plotting
plot(
	IntegralRectangle(:, 1), IntegralRectangle(:, 2), "-;Rectangle Rule;",
	IntegralTrapezoidal(:, 1), IntegralTrapezoidal(:, 2), "-;Trapezoidal Rule;",
	IntegralSimpson(:,1), IntegralSimpson(:,2), "-;Simpson Rule;"
)
xlabel("x(t)")
ylabel("y(t)")
title("Different numerical integrations")
print("assignment_integration.pdf");
