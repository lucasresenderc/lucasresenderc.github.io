$(document).ready(function() {

    var NP = 20;
    $(document).keypress(function(e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == '13') {
            p = []
            for(N=0; N<NP;N++){
                p.push( [w*Math.random(), h*Math.random()] );
            }
        }
    });

    var bucket = [];

    function getRandomFromBucket() {
        var randomIndex = Math.floor(Math.random()*bucket.length);
        return bucket.splice(randomIndex, 1)[0];
    }

    var currentMousePos = { x: -1, y: -1 };
    $(document).mousemove(function(event) {
        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
    });

    var w = document.getElementById("alg").offsetWidth
    var h = document.getElementById("alg").offsetHeight
    var c = document.getElementById("animation");
    c.width = w
    c.height = h
    var ctx = c.getContext("2d");

    var p = []
    for(N=0; N<NP;N++){
        p.push( [w*Math.random(), h*Math.random()] );
    }

    window.setInterval(function(e){
        w = document.getElementById("alg").offsetWidth
        c.width = w
        c.height = h

        q = []
        for(N=0; N<NP; N++){
            //seleciona doadores
            bucket = []
            for (var i=0;i<NP;i++) {
                if(i != N){
                    bucket.push(i);
                }
            }
            x = getRandomFromBucket()
            y = getRandomFromBucket()
            z = getRandomFromBucket()

            sorteia = Math.random()*4

            if(sorteia<=1){
                nx = p[N][0]
                ny = p[N][1]
            } else if (sorteia<=2){
                nx = p[x][0] + Math.sqrt(2)*(p[y][0] - p[z][0])
                ny = p[N][1]
            } else if (sorteia<=3){
                nx = p[N][0]
                ny = p[x][1] + Math.sqrt(2)*(p[y][1] - p[z][1])
            } else {
                nx = p[x][0] + Math.sqrt(2)*(p[y][0] - p[z][0])
                ny = p[x][1] + Math.sqrt(2)*(p[y][1] - p[z][1])
            }

            if( (nx-currentMousePos.x)*(nx-currentMousePos.x) + (ny-currentMousePos.y)*(ny-currentMousePos.y) < (p[N][0]-currentMousePos.x)*(p[N][0]-currentMousePos.x) + (p[N][1]-currentMousePos.y)*(p[N][1]-currentMousePos.y) ){
                q.push( [nx,ny] )
            } else {
                q.push( p[N] )
            }

        }

        //obtem o desvio padrão e a média
        fvalues = []
        mean = 0
        for(N = 0; N<NP; N++){
            fvalues.push( Math.sqrt((q[N][0]-currentMousePos.x)*(q[N][0]-currentMousePos.x) + (q[N][1]-currentMousePos.y)*(q[N][1]-currentMousePos.y)) )
            mean += fvalues[N]
        }
        mean = mean/NP
        sigma = 0
        for(N = 0; N<NP; N++){
            sigma += (mean-fvalues[N])*(mean-fvalues[N])
        }
        sigma = Math.sqrt(sigma/NP)

        gaussians = [-1.282, -.841, -.5244, -.2533,0, .2533, .5244, .841, 1.282]

        for(r=1; r < 9; r++){
            ctx.setLineDash([5, 3]);/*dashes are 5px and spaces are 3px*/
            ctx.beginPath();
            ctx.arc(currentMousePos.x, currentMousePos.y, mean + sigma*gaussians[r], 0, 2 * Math.PI, false);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }

        for(N = 0; N<NP; N++){
            p[N][0] = q[N][0] + Math.random()*.1
            p[N][1] = q[N][1] + Math.random()*.1
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.arc(p[N][0], p[N][1], 3, 0, 2 * Math.PI, true);
            ctx.fill();
        }
    }, 40);


});