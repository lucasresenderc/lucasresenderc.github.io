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
        now_slopes = slope( n, b, g, p, S[t], I[t] )
        predictS = Array(n).fill(0)
        predictI = Array(n).fill(0)
        predictR = Array(n).fill(0)

        for (let i = 0; i < n; i++) {
            predictS[i] += S[t][i] + h*now_slopes[0][i]
            predictI[i] += I[t][i] + h*now_slopes[1][i]
            predictR[i] += R[t][i] + h*now_slopes[2][i]
        }

        next_slopes = slope( n, b, g, p, predictS, predictI )

        newS = Array(n).fill(0)
        newI = Array(n).fill(0)
        newR = Array(n).fill(0)

        for (let i = 0; i < n; i++) {
            newS[i] += S[t][i] + .5*h*now_slopes[0][i]+ .5*h*next_slopes[0][i]
            newI[i] += I[t][i] + .5*h*now_slopes[1][i]+ .5*h*next_slopes[1][i]
            newR[i] += R[t][i] + .5*h*now_slopes[2][i]+ .5*h*next_slopes[2][i]
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
    s = [100000, 15000, 10000, 10000, 10000, 10000]
    t = [.5, .5, .5, .5, .5, .5]
    I0 = [.000005, 0, 0, 0, 0, 0]
    h = .1
    iterations = 1000

    for(let i=0; i<n; i++){
        $("#beta"+i).val( b[i] )
        $("#gamma"+i).val( g[i] )
        $("#i"+i).val( I0[i] )
        $("#s"+i).val( s[i] )
        $("#t"+i).val( t[i] )
    }
    $("#h").val( h )
    $("#T").val( h*iterations )

    // simulate
    $( "#run" ).click(function() {
        // set values
        n = 6
        b = Array(n)
        g = Array(n)
        s = Array(n)
        t = Array(n)
        I0 = Array(n)
        p = []
        totals = 0

        for(let i=0; i<n; i++){
            b[i] = parseFloat($("#beta"+i).val())
            g[i] = parseFloat($("#gamma"+i).val())
            I0[i] = parseFloat($("#i"+i).val())
            s[i] = parseFloat($("#s"+i).val())
            totals += s[i]
            t[i] = parseFloat($("#t"+i).val())
            p.push( Array(n) )
        }
        h = parseFloat($("#h").val())
        iterations = parseFloat($("#T").val())/h

        //construct p
        for(let i=0; i<n; i++){
            p[i][i] = 1
            for(let j=0; j<n; j++){
                if( j != i ){
                    p[i][j] = t[i]*s[j]*t[j]/totals
                    p[i][i] -= p[i][j]
                }
            }
        }

        values = simulate( n, b, g, p, I0, h, iterations )
        S = values[0]
        I = values[1]
        R = values[2]

        // create html spaces
        first = parseInt( $('#run').data('start') )
        
        newtext = '<div class="city-cnt"><div class="row"><span class="close">x</span></div>'
        for( let i = 0; i<n; i++){
            newtext += '<div class="city" id="city'+(first+i)+'"></div>'
        }
        $( "#cities" ).html( $( "#cities" ).html() + newtext + '</div>' )

        $('#run').data('start', first+n )

        // plot
        google.charts.load('current', {'packages':['corechart']});
        for(let i =0; i<n; i++){    
            google.setOnLoadCallback(function() {
                drawChart(S,I,R, i, h, iterations, first);
            });
        }

        function drawChart(S, I, R, city, h, iterations, first) {
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

            var chart = new google.visualization.LineChart(document.getElementById('city'+(city+first)));

            chart.draw(data, options);
        }
    });

});

$("body").on("click", ".close", function(){
    $(this).parent().parent().remove();
});