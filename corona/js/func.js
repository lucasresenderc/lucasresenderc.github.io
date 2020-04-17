function slope( n, b, g, p, S, I ){
    dS = Array(n).fill(0)
    dI = Array(n).fill(0)
    dR = Array(n).fill(0)

    for (let i = 0; i < n; i++) {
        for ( let j = 0; j < n; j++) {
            dS[i] += -S[i]*b[i]*I[j]*p[i][j]
        }
        dI[i] = -dS[i] - g[i]*I[i]
        dR[i] = g[i]*I[i]
    }

    return [dS, dI, dR]
}

/**
 * 
 * @param {number of cities} n 
 * @param {array of transmission rates} b 
 * @param {array of removal rates} g 
 * @param {travel probabilities} p 
 * @param {initial data} I0 
 * @param {time step} h 
 * @param {iterations} iterations 
 */
function simulate( n, b, g, p, I0, h, iterations ){
    // setting up initial data
    S = [ Array(n).fill(0) ]
    I = [ I0 ]
    R = [ Array(n).fill(0) ]

    i = 0
    while(i < n){
        S[0][i] = 1 - I[0][i]
        i++
    }

    // print initial data
    //console.log( S[0], I[0], R[0] )

    // iterating using euler method
    for (let t = 0; t < iterations; t++) {
        slopes = slope( n, b, g, p, S[t], I[t] )
        newS = Array(n).fill(0)
        newI = Array(n).fill(0)
        newR = Array(n).fill(0)

        for (let i = 0; i < n; i++) {
            newS[i] += S[t][i] + h*slopes[0][i]
            newI[i] += I[t][i] + h*slopes[1][i]
            newR[i] += R[t][i] + h*slopes[2][i]
        }

        S.push( newS )
        I.push( newI )
        R.push( newR )

        // print iteration
        //console.log( S[t+1][0], I[t+1][0], R[t+1][0] )
    }

    return [S, I, R]
}

$(document).ready(function() {

    // set values
    n = 6
    b = [.6, .5, .51, .52, .53, .54]
    g = [.4, .35, .36, .37, .38, .39]
    p = [
        [.9, .05, .05, .05, .05, .05],
        [.1, .85, .01, .01, .01, .02],
        [.1, .005, .865, .01, .01, .01],
        [.1, .005, .01, .865, .01, .01],
        [.1, .005, .01, .01, .865, .01],
        [.1, .005, .01, .01, .01, .865]
    ]
    I0 = [.000005, 0, 0, 0, 0, 0]
    h = .1
    iterations = 2000

    for(let i=0; i<n; i++){
        $("#beta"+i).val( b[i] )
        $("#gamma"+i).val( g[i] )
        $("#i"+i).val( I0[i] )
        for(let j=0; j<n; j++){
            $( ("#p"+i)+j ).val( p[i][j] )
        }
    }
    $("#h").val( h )
    $("#T").val( h*iterations )

    // simulate
    $( "#run" ).click(function() {
        // set values
        n = 6
        b = Array(n)
        g = Array(n)
        p = []
        for(let i=0; i<n; i++){
            p.push( Array(n) )
        }
        I0 = Array(n)

        for(let i=0; i<n; i++){
            b[i] = parseFloat($("#beta"+i).val())
            g[i] = parseFloat($("#gamma"+i).val())
            I0[i] = parseFloat($("#i"+i).val())
            for(let j=0; j<n; j++){
                p[i][j] = parseFloat($( ("#p"+i)+j ).val())
            }
        }
        h = parseFloat($("#h").val())
        iterations = parseFloat($("#T").val())/h

        values = simulate( n, b, g, p, I0, h, iterations )
        S = values[0]
        I = values[1]
        R = values[2]

        // plot
        google.charts.load('current', {'packages':['corechart']});
        for(let i =0; i<n; i++){    
            google.setOnLoadCallback(function() {
                drawChart(S,I,R, i, h, iterations);
            });
        }

        function drawChart(S, I, R, city, h, iterations) {
            data = [['Time', 'S', 'I', 'R']]

            for( let t = 0; t<iterations; t++ ){
                data.push( [ t*h, S[t][city], I[t][city], R[t][city] ] )
            }

            console.log( data )

            var data = google.visualization.arrayToDataTable(data);

            var options = {
                title: 'City #'+city,
                titleTextStyle: { color: 'white' },
                curveType: 'function',
                legend: { position: 'bottom', textStyle:{color: '#FFF'} },
                backgroundColor: { fill:'transparent' },
                hAxis: {baselineColor : 'white', textStyle:{color: '#FFF'}, gridlines: {color: '#333'}, minorGridlines: {color: '#333'}},
                vAxis: {baselineColor : 'white', textStyle:{color: '#FFF'}, minValue: -0.05, maxValue: 1.05, gridlines: {color: '#333'}, minorGridlines: {color: '#333'}},
                colors: ['white','white','white'],
                theme: 'maximized',
                series: {
                    0: { lineDashStyle: [1, 0] },
                    1: { lineDashStyle: [2, 2] },
                    2: { lineDashStyle: [4, 4] },
                },
            };

            var chart = new google.visualization.LineChart(document.getElementById('city'+city));

            chart.draw(data, options);
        }
    });

});