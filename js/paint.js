'use strict';

class InterfaceGrafica {
    constructor(numeroQuadradosPorLinha, canvasDiv) {
        this.numeroQuadradosPorLinha = numeroQuadradosPorLinha;
        this.frameBuffer = new FrameBuffer(numeroQuadradosPorLinha);
        this.canvasDiv = canvasDiv;
        this.telaAtiva = "";
        this.desenharCanvasInicial()
    }

    desenharPonto(x, y, color = "#64b5f6") {
        this.frameBuffer.setPixel(x, y, color)
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

    desenharLinhaBresenham(x0, y0, x1, y1, color) {
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
            for (var i = 0; i < pixels.length; i++) {
                var [elemento_x, elemento_y] = pixels[i];

                pixels[i] = [elemento_x, -elemento_y];
            }
        }

        if (trocax) {
            for (var i = 0; i < pixels.length; i++) {
                var [elemento_x, elemento_y] = pixels[i];

                pixels[i] = [-elemento_x, elemento_y];
            }
        }

        if (trocaxy) {
            for (var i = 0; i < pixels.length; i++) {
                var [elemento_x, elemento_y] = pixels[i];

                pixels[i] = [elemento_y, elemento_x];
            }
        }

        for (var i = 0; i < pixels.length; i++) {
            var [elemento_x, elemento_y] = pixels[i];

            this.desenharPonto(elemento_x, elemento_y, color);
        }

        this.draw();
    }

    desenharCirculo(inputX, inputY, raio) {
        inputX = Number(inputX);
        inputY = Number(inputY);
        raio = Number(raio);

        // Desloca o centro para (0, 0)
        var x, y;

        var pixelsPrimeiroOctante = [];

        x = 0;

        y = raio;

        var p = 1 - raio;

        pixelsPrimeiroOctante.push([x, y]);

        // this.desenharPonto(x, y);

        while (x < y) {
            x++;

            if (p < 0) {
                p += (2 * x) + 3
            } else {
                y--;
                p += (2 * x) - (2 * y) + 5
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

    performAndOperation(c1, c2) {
        let result = "";

        for (let i = 0; i < c1.length; i++) {
            result += String(Number(c1[i]) * Number(c2[i]))
        }

        return result;
    }

    recorteLinhaCohenSutherland(p1, p2, x_min, x_max, y_min, y_max) {
        var x, y;
        var x0 = Number(p1[0]), y0 = Number(p1[1]);
        var x1 = Number(p2[0]), y1 = Number(p2[1]);

        x_min = Number(x_min);
        x_max = Number(x_max);
        y_min = Number(y_min);
        y_max = Number(y_max);

        var c1 = this.mkcode(x0, y0, x_min, x_max, y_min, y_max);
        var c2 = this.mkcode(x1, y1, x_min, x_max, y_min, y_max);

        if (c1 === "0000" && c2 === "0000") {
            this.reset();
            this.desenharLinhaBresenham(x0, y0, x1, y1);
        } else if (this.performAndOperation(c1, c2) !== "0000") {
            this.reset();
            alert('Linha totalmente fora');
        } else {
            var pontoFora = (c1 !== "0000") ? c1 : c2;

            if (pontoFora[0] === "1") {
                /* Descartar topo */
                x = x0 + (x1 - x0) * (y_max - y0) / (y1 - y0);
                y = y_max;
            } else if (pontoFora[1] === "1") {
                /* Descartar embaixo */
                x = x0 + (x1 - x0) * (y_min - y0) / (y1 - y0);
                y = y_min;
            } else if (pontoFora[2] === "1") {
                /* Descartar direita */
                y = y0 + (y1 - y0) * (x_max - x0) / (x1 - x0);
                x = x_max;
            } else if (pontoFora[3] === "1") {
                /* Descartar esquerda */
                y = y0 + (y1 - y0) * (x_min - x0) / (x1 - x0);
                x = x_min;
            }

            if (pontoFora == c1) {
                x0 = Math.round(x);
                y0 = Math.round(y);
            } else {
                x1 = Math.round(x);
                y1 = Math.round(y);
            }

            this.recorteLinhaCohenSutherland([x0, y0], [x1, y1], x_min, x_max, y_min, y_max);
        }
    }

    mkcode(x, y, x_min, x_max, y_min, y_max) {
        x = Number(x);
        y = Number(y);

        var code = '';
        code += this.sign(y_max - y);
        code += this.sign(y - y_min);
        code += this.sign(x_max - x);
        code += this.sign(x - x_min);

        return code;
    }

    sign(n) {
        if (n >= 0) {
            return '0';
        }

        return '1';
    }

    preencher(x, y, color, edgeColor = "#64b5f6") {
        this.floodFill(x, y, color, edgeColor);

        this.draw();
    }

    floodFill(x, y, color, edgeColor = "#64b5f6") {
        x = Number(x);
        y = Number(y);

        var current = this.frameBuffer.getPixel(x, y);

        if (current && current != edgeColor && current != color) {
            this.desenharPonto(x, y, color);
            this.floodFill(x + 1, y, color, edgeColor);
            this.floodFill(x, y + 1, color, edgeColor);
            this.floodFill(x - 1, y, color, edgeColor);
            this.floodFill(x, y - 1, color, edgeColor);
        }
    }

    draw() {
        for (var i = 0; i < this.numeroQuadradosPorLinha; i++) {
            for (var j = 0; j < this.numeroQuadradosPorLinha; j++) {
                // var pixel = document.getElementById(i + "_" + j);
                $("#" + i + "_" + j).animate({
                    backgroundColor: this.frameBuffer.getPixel(i, j)
                }, 100);

                // pixel.style.backgroundColor = this.frameBuffer.getPixel(i, j)
            }
        }
    }

    reset() {
        this.frameBuffer.reset();

        this.draw();
    }

    ativarTela(tela) {
        this.telaAtiva = tela;
    }

    isPixelJaVisitado(x, y, pixelsJaVisitados) {
        for (const pixel of pixelsJaVisitados) {
            if (pixel.x === x && pixel.y === y) {
                return true
            }
        }

        return false;
    }

    getPixelsSelecionados(x, y, pixelsJaVisitados = []) {
        x = Number(x);
        y = Number(y);

        const pixelInicial = this.frameBuffer.getPixel(x, y);

        if (this.isPixelJaVisitado(x, y, pixelsJaVisitados)) {
            return []
        }

        pixelsJaVisitados.push({x: x, y: y});

        if (pixelInicial && pixelInicial !== "#ffffff") {
            let result = [{x: x, y: y}];

            // Direita
            result = result.concat(this.getPixelsSelecionados(x + 1, y, pixelsJaVisitados));

            // Diagonal Superior Direita
            result = result.concat(this.getPixelsSelecionados(x + 1, y + 1, pixelsJaVisitados));

            // Cima
            result = result.concat(this.getPixelsSelecionados(x, y + 1, pixelsJaVisitados));

            // Diagonal Superior Esquerda
            result = result.concat(this.getPixelsSelecionados(x - 1, y + 1, pixelsJaVisitados));

            // Esquerda
            result = result.concat(this.getPixelsSelecionados(x - 1, y, pixelsJaVisitados));

            // Diagonal Inferior Esquerda
            result = result.concat(this.getPixelsSelecionados(x - 1, y - 1, pixelsJaVisitados));

            // Baixo
            result = result.concat(this.getPixelsSelecionados(x, y - 1, pixelsJaVisitados));

            // Diagonal Inferior Direita
            result = result.concat(this.getPixelsSelecionados(x + 1, y - 1, pixelsJaVisitados));

            return result;
        }

        return [];
    }

    realizarTranslacao(dadosTranslacao) {
        console.log(dadosTranslacao);

        const deltaX = Number(dadosTranslacao.xFinal) - Number(dadosTranslacao.xInicial);
        const deltaY = Number(dadosTranslacao.yFinal) - Number(dadosTranslacao.yInicial);

        for (const pixel of dadosTranslacao.pixelsSelecionados) {
            pixel.color = this.frameBuffer.getPixel(pixel.x, pixel.y);

            this.frameBuffer.setPixel(pixel.x, pixel.y, this.frameBuffer.defaultColor);
        }

        for (const pixel of dadosTranslacao.pixelsSelecionados) {
            const newX = pixel.x + deltaX;
            const newY = pixel.y + deltaY;

            this.frameBuffer.setPixel(newX, newY, pixel.color);
        }

        interfaceGrafica.draw();
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

    isValidPixel(x, y) {
        return x >= 0 && x < this.matriz.length && y >= 0 && y < this.matriz.length
    }

    setPixel(x, y, cor=this.defaultColor) {
        if (this.isValidPixel(x, y)) {
            this.matriz[x][y] = cor;
        }
    }

    getPixel(x, y) {
        if (this.isValidPixel(x, y)) {
            return this.matriz[x][y];
        } else {
            return null
        }
    }

    reset() {
        this.initializarMatriz(this.matriz.length);
    }
}

let interfaceGrafica;

$(function () {
    var div = document.getElementById('div'), x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    var firstPixelRecorteLinha, secondPixelRecorteLinha, p1, p2;

    let dadosTranslacao = {
        xInicial: null,
        yInicial: null,
        xFinal: null,
        yFinal: null,
        pixelsSelecionados: []
    };

    function reCalc() { //This will restyle the div
        var x3 = Math.min(x1, x2); //Smaller X
        var x4 = Math.max(x1, x2); //Larger X
        var y3 = Math.min(y1, y2); //Smaller Y
        var y4 = Math.max(y1, y2); //Larger Y
        div.style.left = x3 + 'px';
        div.style.top = y3 + 'px';
        div.style.width = x4 - x3 + 'px';
        div.style.height = y4 - y3 + 'px';
    }


    var numeroQuadradosPorLinha = 40;
    interfaceGrafica = new InterfaceGrafica(numeroQuadradosPorLinha, $(".grid"));

    var pixelsSelecionados = [];

    $(".pixel").on('click', function (event) {
        var [x, y] = event.target.id.split('_');
        var linhaRecorteDesenhada = false;

        if (interfaceGrafica.telaAtiva == "preenchimento") {
            var color = "#" + $("#color").val();

            interfaceGrafica.preencher(x, y, color)
        } else if (interfaceGrafica.telaAtiva === "bresenham") {
            if (pixelsSelecionados.length >= 2) {
                pixelsSelecionados.shift();
            }

            pixelsSelecionados.push({x: x, y: y});

            if (pixelsSelecionados.length == 2) {
                interfaceGrafica.desenharLinhaBresenham(pixelsSelecionados[0].x, pixelsSelecionados[0].y,
                    pixelsSelecionados[1].x, pixelsSelecionados[1].y);
            }
        } else if (interfaceGrafica.telaAtiva == "circulo") {
            var raio = $('#raio_circulo').val();

            if (!raio) {
                alert('Insira um raio válido');
            }

            interfaceGrafica.desenharCirculo(x, y, raio);
        } else if (interfaceGrafica.telaAtiva === "desenharLinhaRecorte") {
            if (pixelsSelecionados.length >= 2) {
                pixelsSelecionados.shift();
            }

            pixelsSelecionados.push({x: x, y: y});

            if (pixelsSelecionados.length === 2) {
                interfaceGrafica.desenharLinhaBresenham(pixelsSelecionados[0].x, pixelsSelecionados[0].y,
                    pixelsSelecionados[1].x, pixelsSelecionados[1].y);

                p1 = [pixelsSelecionados[0].x, pixelsSelecionados[0].y];
                p2 = [pixelsSelecionados[1].x, pixelsSelecionados[1].y];

                interfaceGrafica.telaAtiva = "recorteLinha";
            }
        } else if (interfaceGrafica.telaAtiva == "recorteLinha") {
            onmousedown = function (e) {
                firstPixelRecorteLinha = e.srcElement;

                div.hidden = 0; //Unhide the div
                x1 = e.clientX; //Set the initial X
                y1 = e.clientY; //Set the initial Y
                reCalc();
            };
            onmousemove = function (e) {
                x2 = e.clientX; //Update the current position X
                y2 = e.clientY; //Update the current position Y
                reCalc();
            };
            onmouseup = function (e) {
                var x_min, x_max, y_min, y_max;

                secondPixelRecorteLinha = e.srcElement;

                [x_min, y_max] = firstPixelRecorteLinha.id.split('_');
                [x_max, y_min] = secondPixelRecorteLinha.id.split('_');

                div.hidden = 1; //Hide the div

                interfaceGrafica.recorteLinhaCohenSutherland(p1, p2, x_min, x_max, y_min, y_max);
            };
        } else if (interfaceGrafica.telaAtiva === "recortePoligono") {
            onmousedown = function (e) {
                firstPixelRecorteLinha = e.srcElement;

                div.hidden = 0; //Unhide the div
                x1 = e.clientX; //Set the initial X
                y1 = e.clientY; //Set the initial Y
                reCalc();
            };
            onmousemove = function (e) {
                x2 = e.clientX; //Update the current position X
                y2 = e.clientY; //Update the current position Y
                reCalc();
            };
            onmouseup = function (e) {
                var x_min, x_max, y_min, y_max;

                secondPixelRecorteLinha = e.srcElement;

                [x_min, y_max] = firstPixelRecorteLinha.id.split('_');
                [x_max, y_min] = secondPixelRecorteLinha.id.split('_');

                div.hidden = 1; //Hide the div
            };
        } else if (interfaceGrafica.telaAtiva === "translacao") {
            console.log('translacao');

            onmousedown = function (e) {
                console.log('Início do movimento');

                [dadosTranslacao.xInicial, dadosTranslacao.yInicial] = e.target.id.split('_');

                dadosTranslacao.pixelsSelecionados = interfaceGrafica.getPixelsSelecionados(dadosTranslacao.xInicial, dadosTranslacao.yInicial);

                // console.log('onmousedown');
            };

            onmousemove = function (e) {
                // console.log('onmousemove');
            };

            onmouseup = function (e) {
                console.log('Fim do movimento');

                [dadosTranslacao.xFinal, dadosTranslacao.yFinal] = e.target.id.split('_');
                console.log(dadosTranslacao);

                interfaceGrafica.realizarTranslacao(dadosTranslacao);

                // console.log('onmouseup');
            };
        }
    });

    /*$(".pixel").on('mouseover', function(event) {
     var [x, y] = event.target.id.split('_');

     // console.log(event);

     if (event.which == 1) {
     interfaceGrafica.desenharPonto(x, y)
     $("#" + x + "_" + y).animate({
     backgroundColor: interfaceGrafica.frameBuffer.getPixel(x, y)
     }, 200);
     // interfaceGrafica.draw();
        }
     })*/
});


