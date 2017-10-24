'use strict';

class InterfaceGrafica {
    constructor(numeroQuadradosPorLinha, canvasDiv) {
        this.numeroQuadradosPorLinha = numeroQuadradosPorLinha;
        this.frameBuffer = new FrameBuffer(numeroQuadradosPorLinha);
        this.canvasDiv = canvasDiv;

        this.desenharCanvasInicial()
    }

    desenharPonto(x, y) {
    	if (x >= 0 && y >= 0) {
        	this.frameBuffer.setPixel(x, y, "#64b5f6")
    	}
    }

    desenharCanvasInicial() {
        for (var i = this.numeroQuadradosPorLinha - 1; i >= 0; i--) {
            var row = $("<div>");
            row.addClass('row row-pixels');

            for (var j = 0; j < this.numeroQuadradosPorLinha; j++) {
                var quadrado = $('<div>');

                quadrado.attr("id", j + "_" + i);
                quadrado.addClass("pixel");
                quadrado.attr("title", j + ", " + i);

                row.append(quadrado);
            }

            this.canvasDiv.append(row);
        }
    }

    desenharLinhaBresenham(x0, y0, x1, y1) {
        x0 = Number(x0);
        y0 = Number(y0);
        x1 = Number(x1);
        y1 = Number(y1);

        // --------------- REFLEXÃO
        var trocaxy = false;
        var trocax = false;
        var trocay = false;

        var deltaX = x1 - x0;
        var deltaY = y1 - y0;

        var m = deltaY / deltaX;

        if ((m > 1) || (m < -1)) {
            [x0, y0] = [y0, x0];
            [x1, y1] = [y1, x1];
            trocaxy = true;
        }

        if (x0 > x1) {
            x0 = -x0;
            x1 = -x1;
            trocax = true;
        }

        if (y0 > y1) {
            y0 = -y0;
            y1 = -y1;
            trocay = true;
        }

        // ----------------------
        var x = x0;
        var y = y0;

        deltaX = x1 - x0;
        deltaY = y1 - y0;

        m = deltaY / deltaX;

        var e = m - 1 / 2;

        var pixels = [];

        pixels.push([x, y]);

        //this.desenharPonto(x, y);

        for (x = x0 + 1; x <= x1; x++) {
            if (e >= 0) {
                y += 1;
                e -= 1;
            }

            e += m;

            pixels.push([x, y]);

            //this.desenharPonto(x, y);
        }

        // ------------- REFLEXÃO -1

        if (trocay) {
            for (var i = 0 ; i < pixels.length; i++) {
                var [elemento_x, elemento_y] = pixels[i];

                pixels[i] = [elemento_x, -elemento_y];
            }
        }

        if (trocax) {
            for (var i = 0 ; i < pixels.length; i++) {
                var [elemento_x, elemento_y] = pixels[i];

                pixels[i] = [-elemento_x, elemento_y];
            }
        }

        if (trocaxy) {
            for (var i = 0 ; i < pixels.length; i++) {
                var [elemento_x, elemento_y] = pixels[i];

                pixels[i] = [elemento_y, elemento_x];
            }
        }

        for (var i = 0 ; i < pixels.length; i++) {
            var [elemento_x, elemento_y] = pixels[i];

            this.desenharPonto(elemento_x, elemento_y);
        }

        this.draw();
    }

    desenharCirculo(inputX, inputY, raio) {
    	console.log('desenharCirculo');

    	inputX = Number(inputX);
    	inputY = Number(inputY);
    	raio = Number(raio);

    	// Desloca o centro para (0, 0)
    	var x, y;

    	var pixelsToDraw = [];
    	var pixelsPrimeiroOctante = []

    	x = 0;

    	y = raio;

    	var p = 1 - raio;

    	pixelsPrimeiroOctante.push([x, y]);

    	// this.desenharPonto(x, y);

    	while (x < y) {
    		x++;

    		if (p < 0) {
    			p += (2*x) + 3
    		} else {
    			y--;
    			p += (2*x) - (2*y) + 5 
    		}

    		// this.desenharPonto(x, y);

    		pixelsPrimeiroOctante.push([x, y]);

    	}

    	var pixelsToDraw = pixelsPrimeiroOctante.slice();

    	for (var i = 0; i < pixelsPrimeiroOctante.length; i++) {
    		var pixelX = pixelsPrimeiroOctante[i][0];
    		var pixelY = pixelsPrimeiroOctante[i][1];

    		pixelsToDraw.push([pixelX, pixelY]);

    		// -x y
    		pixelsToDraw.push([-pixelX, pixelY]);

    		// x -y
    		pixelsToDraw.push([pixelX, -pixelY]);

    		// -x -y
    		pixelsToDraw.push([-pixelX, -pixelY]);


			// y x
    		pixelsToDraw.push([pixelY, pixelX]);

			// -y x
    		pixelsToDraw.push([-pixelY, pixelX]);

			// Y -x
    		pixelsToDraw.push([pixelY, -pixelX]);

			// -y -x
    		pixelsToDraw.push([-pixelY, -pixelX]);
    	}

    	for (var i = 0; i < pixelsToDraw.length; i++) {
    		var [elemento_x, elemento_y] = pixelsToDraw[i];

    		elemento_x += inputX;
    		elemento_y += inputY;

            this.desenharPonto(elemento_x, elemento_y);
    	}

    	this.draw();
    }


    draw() {
        for (var i = 0; i < this.numeroQuadradosPorLinha; i++) {
            for (var j = 0; j < this.numeroQuadradosPorLinha; j++) {
                // var pixel = document.getElementById(i + "_" + j);
                $("#" + i + "_" + j).animate({
				    backgroundColor: this.frameBuffer.getPixel(i, j)
				  }, 1500);

                // pixel.style.backgroundColor = this.frameBuffer.getPixel(i, j)
            }
        }
    }

    reset() {
        this.frameBuffer.reset();

        this.draw();
    }
}

class FrameBuffer {
    constructor(size) {
        this.defaultColor = "#ffffff";
        this.initializarMatriz(size);
    }

    initializarMatriz(size) {
        this.matriz = [];

        for (var i = 0; i < size; i++) {
            var linha = [];

            for (var j = 0; j < size; j++) {
                linha.push(this.defaultColor)
            }

            this.matriz.push(linha)
        }
    }

    setPixel(x, y, cor) {
        this.matriz[x][y] = cor;
    }

    getPixel(x, y) {
        return this.matriz[x][y];
    }

    reset() {
        this.initializarMatriz(this.matriz.length);
    }
}

var interfaceGrafica;

$(function() {
    var numeroQuadradosPorLinha = 15;
    interfaceGrafica = new InterfaceGrafica(numeroQuadradosPorLinha, $(".grid"));
});


