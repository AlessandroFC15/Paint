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

    desenharLinhaBresenham(x0, y0, x1, y1, color, shouldDraw = true, shouldDrawEdges = true) {
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

        for (x = x0 + 1; x <= x1; x++) {
            if (e >= 0) {
                y += 1;
                e -= 1;
            }

            e += m;

            pixels.push([x, y]);
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

        if (! shouldDrawEdges) {
            pixels.shift();
            pixels.pop();
        }

        for (var i = 0; i < pixels.length; i++) {
            var [elemento_x, elemento_y] = pixels[i];

            this.desenharPonto(elemento_x, elemento_y, color);
        }

        if (shouldDraw) {
            this.draw();
        }
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

    listToMatrix(list, elementsPerSubArray) {
        var matrix = [], i, k;

        for (i = 0, k = -1; i < list.length; i++) {
            if (i % elementsPerSubArray === 0) {
                k++;
                matrix[k] = [];
            }

            matrix[k].push(list[i]);
        }

        return matrix;
    }

    ajustarPontosIntersecao(pontosIntersecao) {
        let matriz = this.listToMatrix(pontosIntersecao, 2);

        if (matriz.every((par) => par[0].x === par[1].x && par[0].y === par[1].y)) {
            return pontosIntersecao.slice(1, pontosIntersecao.length - 1);
        } else {
            return pontosIntersecao
        }
    }

    preencherScanLine(verticesPoligono, color) {
        const yMax = Math.max(...(verticesPoligono.map(ponto => ponto.y)));
        const yMin = Math.min(...(verticesPoligono.map(ponto => ponto.y)));

        console.log(verticesPoligono);

        // 1º Passo = Construir a Edge Table
        let tabelaArestas = [];

        for (let i = 0; i < verticesPoligono.length; i++) {
            let k = (i + 1) % verticesPoligono.length;

            const verticeInicialAresta = verticesPoligono[i];
            const verticeFinalAresta = verticesPoligono[k];

            let dadosAresta = {
                yMin: Math.min(verticeInicialAresta.y, verticeFinalAresta.y),
                yMax: Math.max(verticeInicialAresta.y, verticeFinalAresta.y),
                xMin: Math.min(verticeInicialAresta.x, verticeFinalAresta.x),
                xMax: Math.max(verticeInicialAresta.x, verticeFinalAresta.x),
                inversoSlope: (verticeFinalAresta.x - verticeInicialAresta.x) / (verticeFinalAresta.y - verticeInicialAresta.y),
            };

            for (let vertice of [verticeInicialAresta, verticeFinalAresta]) {
                if (vertice.y === dadosAresta.yMin) {
                    dadosAresta.xParaYMin = vertice.x
                }
            }

            tabelaArestas.push(dadosAresta);
        }

        console.log('>> Tabela Arestas <<');
        console.table(tabelaArestas);

        let intersecoes = [];

        // 2º Passo = identificar as diversas interseções com a linha de varredura
        for (let yVarredura = yMin + 1; yVarredura < yMax; yVarredura++) {
            let intersecoesLinha = [];

            for (let dadosAresta of tabelaArestas) {
                let x = dadosAresta.inversoSlope * (yVarredura - dadosAresta.yMin) + dadosAresta.xParaYMin;

                if (x >= dadosAresta.xMin && x <= dadosAresta.xMax && yVarredura >= dadosAresta.yMin && yVarredura <= dadosAresta.yMax) {
                    intersecoesLinha.push({x: x, y: yVarredura});
                }
            }

            // Ordenando os pontos...
            intersecoesLinha.sort((a, b) => a.x - b.x);

            intersecoes.push(intersecoesLinha);
        }

        // 3º Passo = Traçar as linhas a partir dos pontos de interseção
        for (let pontosIntersecao of intersecoes) {
            let pontos = this.ajustarPontosIntersecao(pontosIntersecao).slice(0);

            while (pontos.length > 0) {
                const p1 = pontos.shift();
                const p2 = pontos.shift();

                this.desenharLinhaBresenham(Math.round(p1.x), Math.round(p1.y),
                    Math.round(p2.x), Math.round(p2.y), color, false, false);
            }
        }

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

    grausParaRadianos(valorAnguloEmGraus) {
        return valorAnguloEmGraus * (Math.PI/180)
    }

    realizarRotacao(pixelsSelecionados, pontoRotacao, angulo=90) {
        // 1º Passo = Realizar translação

        const deltaX = Number(pontoRotacao.x);
        const deltaY = Number(pontoRotacao.y);

        for (const pixel of pixelsSelecionados) {
            pixel.color = this.frameBuffer.getPixel(pixel.x, pixel.y);
            this.frameBuffer.setPixel(pixel.x, pixel.y, this.frameBuffer.defaultColor);

            pixel.x -= deltaX;
            pixel.y -= deltaY;
        }

        // 2º Passo = Realizar a rotação e a translação de volta

        for (const pixel of pixelsSelecionados) {
            const newX = (pixel.x * Math.cos(this.grausParaRadianos(angulo))) - (pixel.y * Math.sin(this.grausParaRadianos(angulo)));
            const newY = (pixel.x * Math.sin(this.grausParaRadianos(angulo))) + (pixel.y * Math.cos(this.grausParaRadianos(angulo)));

            this.frameBuffer.setPixel(Math.round(newX) + deltaX, Math.round(newY) + deltaY, pixel.color);
        }

        interfaceGrafica.draw();
    }

    realizarEscala(pixelsSelecionados, origem, escalaX, escalaY) {
        // 1º Passo = Realizar translação

        const deltaX = Number(origem.x);
        const deltaY = Number(origem.y);

        for (const pixel of pixelsSelecionados) {
            pixel.color = this.frameBuffer.getPixel(pixel.x, pixel.y);
            this.frameBuffer.setPixel(pixel.x, pixel.y, this.frameBuffer.defaultColor);

            pixel.x -= deltaX;
            pixel.y -= deltaY;
        }

        let pixelsAposEscala = [];

        // 2º Passo = Realizar a escala e a translação de volta

        for (const pixel of pixelsSelecionados) {
            const newX = Math.round(pixel.x * escalaX);
            const newY = Math.round(pixel.y * escalaY);

            this.frameBuffer.setPixel(Math.round(newX) + deltaX, Math.round(newY) + deltaY, pixel.color);

            /*pixelsAposEscala.push({
                x: Math.round(newX) + deltaX,
                y: Math.round(newY) + deltaY,
                color: pixel.color
            })*/
        }

        console.log(pixelsAposEscala);

        /*for (let i = 0; i < pixelsAposEscala.length - 1; i++) {
            const pixel = pixelsAposEscala[i];
            const nextPixel = pixelsAposEscala[i + 1];

            console.log('>> Desenhando linha <<');

            this.desenharLinhaBresenham(pixel.x, pixel.y, nextPixel.x, nextPixel.y, pixel.color, false);
        }*/

        interfaceGrafica.draw();
    }

    // Returns x-value of point of intersectipn of two
    // lines
    x_intersect(x1, y1, x2, y2,
                         x3, y3, x4, y4) {
        let num = (x1*y2 - y1*x2) * (x3-x4) - (x1-x2) * (x3*y4 - y3*x4);
        let den = (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4);
        return num/den;
    }

    // Returns y-value of point of intersectipn of
    // two lines
    y_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
    {
        let num = (x1*y2 - y1*x2) * (y3-y4) - (y1-y2) * (x3*y4 - y3*x4);
        let den = (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4);
        return num/den;
    }

    // This functions clips all the edges w.r.t one clip
    // edge of clipping area
    clipp(dadosEntrada, x1, y1, x2, y2) {
        let pontos = [];

        for (let i = 0; i < dadosEntrada.length; i++) {

            // i and k form a line in polygon
            let k = (i+1) % dadosEntrada.length;
            let ix = dadosEntrada[i][0], iy = dadosEntrada[i][1];
            let kx = dadosEntrada[k][0], ky = dadosEntrada[k][1];

            // Calculating position of first point
            // w.r.t. clipper line
            let i_pos = (x2-x1) * (iy-y1) - (y2-y1) * (ix-x1);

            // Calculating position of second point
            // w.r.t. clipper line
            let k_pos = (x2-x1) * (ky-y1) - (y2-y1) * (kx-x1);

            // Case 1 : When both points are inside
            if (i_pos < 0  && k_pos < 0)
            {
                //Only second point is added
                pontos.push([kx, ky]);
            }

            // Case 2: When only first point is outside
            else if (i_pos >= 0  && k_pos < 0)
            {
                // Point of intersection with edge
                // and the second point is added
                pontos.push([this.x_intersect(x1, y1, x2, y2, ix, iy, kx, ky), this.y_intersect(x1, y1, x2, y2, ix, iy, kx, ky)]);

                pontos.push([kx, ky]);
            }


            // Case 3: When only second point is outside
            else if (i_pos < 0  && k_pos >= 0)
            {
                //Only point of intersection with edge is added
                pontos.push([this.x_intersect(x1, y1, x2, y2, ix, iy, kx, ky), this.y_intersect(x1, y1, x2, y2, ix, iy, kx, ky)]);
            }

            // Case 4: When both points are outside
            else
            {
                //No points are added
            }
        }

        return pontos;
    }

    suthHodgClip(verticesSubjectPolygon, verticesClipPolygon) {
        let list = verticesSubjectPolygon;

        for (let i = 0; i < verticesClipPolygon.length; i++) {
            let k = (i+1) % verticesClipPolygon.length;

            // We pass the current array of vertices, it's size
            // and the end points of the selected clipper line
            let output = this.clipp(list, verticesClipPolygon[i][0], verticesClipPolygon[i][1], verticesClipPolygon[k][0],
                verticesClipPolygon[k][1]);

            list = output;
        }

        console.log(list);

        this.reset();

        for (let i = 0; i < list.length; i++) {
            let k = (i+1) % list.length;

            let vertice = list[i].map((ponto) => Math.round(ponto));

            let proximoVertice = list[k].map((ponto) => Math.round(ponto));

            this.desenharLinhaBresenham(vertice[0], vertice[1], proximoVertice[0], proximoVertice[1], "#000", false)
        }

        console.log(list);

        this.draw();

        /*let ultimoVertice = outputList[outputList.length - 1];
        ultimoVertice[0] = Math.round(ultimoVertice[0]);
        ultimoVertice[1] = Math.round(ultimoVertice[1]);

        this.desenharLinhaBresenham(ultimoVertice[0], ultimoVertice[1], outputList[0][0], outputList[0][1], "#000", false);

        this.draw();*/

        // Printing vertices of clipped polygon
        /*for (let i = 0; i < verticesSubjectPolygon.length; i++) {
            console.log(verticesSubjectPolygon[i][0]);
            console.log(verticesSubjectPolygon[i][1]);
            console.log('-----');
        }*/
    }

    clip (subjectPolygon, clipPolygon) {
        console.log(subjectPolygon);
        console.log(clipPolygon);

        var cp1, cp2, s, e;
        var inside = function (p) {
            return (cp2[0]-cp1[0])*(p[1]-cp1[1]) > (cp2[1]-cp1[1])*(p[0]-cp1[0]);
        };
        var intersection = function () {
            var dc = [ cp1[0] - cp2[0], cp1[1] - cp2[1] ],
                dp = [ s[0] - e[0], s[1] - e[1] ],
                n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
                n2 = s[0] * e[1] - s[1] * e[0],
                n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
            return [(n1*dp[0] - n2*dc[0]) * n3, (n1*dp[1] - n2*dc[1]) * n3];
        };
        var outputList = subjectPolygon;
        cp1 = clipPolygon[clipPolygon.length-1];
        for (var j in clipPolygon) {
            var cp2 = clipPolygon[j];

            console.log("Clip Polygon: ");
            console.log(cp2);

            var inputList = outputList;
            outputList = [];

            s = inputList[inputList.length - 1]; //last on the input list
            for (var i in inputList) {
                var e = inputList[i];
                console.log('>> Elemento da Input List');
                console.log(e);
                if (inside(e)) {
                    if (!inside(s)) {
                        outputList.push(intersection());
                    }
                    outputList.push(e);
                }
                else if (inside(s)) {
                    outputList.push(intersection());
                }
                s = e;
            }
            cp1 = cp2;
        }

        console.log(outputList);

        for (let i = 0; i < outputList.length - 1; i++) {
            let vertice = outputList[i];
            vertice[0] = Math.round(vertice[0]);
            vertice[1] = Math.round(vertice[1]);

            let proximoVertice = outputList[i + 1];
            proximoVertice[0] = Math.round(proximoVertice[0]);
            proximoVertice[1] = Math.round(proximoVertice[1]);

            this.desenharLinhaBresenham(vertice[0], vertice[1], proximoVertice[0], proximoVertice[1], "#000", false)
        }

        let ultimoVertice = outputList[outputList.length - 1];
        ultimoVertice[0] = Math.round(ultimoVertice[0]);
        ultimoVertice[1] = Math.round(ultimoVertice[1]);

        this.desenharLinhaBresenham(ultimoVertice[0], ultimoVertice[1], outputList[0][0], outputList[0][1], "#000", false);

        this.draw();

        return outputList;
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

    let dadosPreenchimentoScanline = {
        poligono: {
            vertices: [],
            isPronto: false
        },
    };

    let dadosRecortePoligono = {
        poligonoASerRecortado: {
            vertices: [],
            isPronto: false
        },
        poligonoDeRecorte: {
            vertices: [],
            isPronto: false
        }
    };

    $(".pixel").on('click', function (event) {
        const [x, y] = event.target.id.split('_');
        var linhaRecorteDesenhada = false;

        if (interfaceGrafica.telaAtiva === "preenchimento") {
            const color = "#" + $("#color").val();

            interfaceGrafica.preencher(x, y, color)
        } else if (interfaceGrafica.telaAtiva === "preenchimentoScanline") {
            if (! dadosPreenchimentoScanline.poligono.isPronto) {
                let vertices = dadosPreenchimentoScanline.poligono.vertices;

                vertices.push({x: Number(x), y: Number(y)});

                if (vertices.length >= 2) {
                    const ultimoVerticeInserido = vertices[vertices.length - 1];
                    const penultimoVerticeInserido = vertices[vertices.length - 2];

                    interfaceGrafica.desenharLinhaBresenham(penultimoVerticeInserido.x, penultimoVerticeInserido.y,
                        ultimoVerticeInserido.x, ultimoVerticeInserido.y);

                    const primeiroVerticeInserido = vertices[0];

                    if (ultimoVerticeInserido.x === primeiroVerticeInserido.x && ultimoVerticeInserido.y === primeiroVerticeInserido.y) {
                        vertices.pop();

                        dadosPreenchimentoScanline.poligono.isPronto = true;
                    }
                }
            } else {
                const color = "#" + $("#colorScanline").val();

                interfaceGrafica.preencherScanLine(dadosPreenchimentoScanline.poligono.vertices, color);
            }
        } else if (interfaceGrafica.telaAtiva === "bresenham") {
            if (pixelsSelecionados.length >= 2) {
                pixelsSelecionados.shift();
            }

            pixelsSelecionados.push({x: x, y: y});

            if (pixelsSelecionados.length === 2) {
                interfaceGrafica.desenharLinhaBresenham(pixelsSelecionados[0].x, pixelsSelecionados[0].y,
                    pixelsSelecionados[1].x, pixelsSelecionados[1].y);
            }
        } else if (interfaceGrafica.telaAtiva === "circulo") {
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
        } else if (interfaceGrafica.telaAtiva === "recorteLinha") {
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
            if (! dadosRecortePoligono.poligonoASerRecortado.isPronto) {
                let vertices = dadosRecortePoligono.poligonoASerRecortado.vertices;

                vertices.push([Number(x), Number(y)]);

                if (vertices.length >= 2) {
                    const ultimoVerticeInserido = vertices[vertices.length - 1];
                    const penultimoVerticeInserido = vertices[vertices.length - 2];

                    interfaceGrafica.desenharLinhaBresenham(penultimoVerticeInserido[0], penultimoVerticeInserido[1],
                        ultimoVerticeInserido[0], ultimoVerticeInserido[1]);

                    const primeiroVerticeInserido = vertices[0];

                    if (ultimoVerticeInserido[0] === primeiroVerticeInserido[0] && ultimoVerticeInserido[1] === primeiroVerticeInserido[1]) {
                        vertices.pop();

                        dadosRecortePoligono.poligonoASerRecortado.isPronto = true;

                        alert('Polígono pronto! Desenhe o de recorte agora!');
                    }
                }
            } else {
                if (! dadosRecortePoligono.poligonoDeRecorte.isPronto) {
                    let vertices = dadosRecortePoligono.poligonoDeRecorte.vertices;

                    // vertices.push({x: Number(x), y: Number(y)});
                    vertices.push([Number(x), Number(y)]);

                    if (vertices.length >= 2) {
                        const ultimoVerticeInserido = vertices[vertices.length - 1];
                        const penultimoVerticeInserido = vertices[vertices.length - 2];

                        interfaceGrafica.desenharLinhaBresenham(penultimoVerticeInserido[0], penultimoVerticeInserido[1],
                            ultimoVerticeInserido[0], ultimoVerticeInserido[1], "#ccc");

                        const primeiroVerticeInserido = vertices[0];

                        if (ultimoVerticeInserido[0] === primeiroVerticeInserido[0] && ultimoVerticeInserido[1] === primeiroVerticeInserido[1]) {
                            vertices.pop();

                            dadosRecortePoligono.poligonoDeRecorte.isPronto = true;

                            alert('Tudo pronto!');

                            console.log(dadosRecortePoligono);
                            console.log(dadosRecortePoligono.poligonoASerRecortado.vertices);
                            console.log(dadosRecortePoligono.poligonoDeRecorte.vertices);

                            console.log(interfaceGrafica.suthHodgClip(dadosRecortePoligono.poligonoASerRecortado.vertices, dadosRecortePoligono.poligonoDeRecorte.vertices));
                        }
                    }
                } else {
                    alert('Tudo pronto!');

                    console.log(dadosRecortePoligono);
                }

            }
        } else if (interfaceGrafica.telaAtiva === "translacao") {
            console.log('translacao');

            onmousedown = function (e) {
                console.log('Início do movimento');

                [dadosTranslacao.xInicial, dadosTranslacao.yInicial] = e.target.id.split('_');

                dadosTranslacao.pixelsSelecionados = interfaceGrafica.getPixelsSelecionados(dadosTranslacao.xInicial, dadosTranslacao.yInicial);
            };

            onmouseup = function (e) {
                console.log('Fim do movimento');

                [dadosTranslacao.xFinal, dadosTranslacao.yFinal] = e.target.id.split('_');
                console.log(dadosTranslacao);

                interfaceGrafica.realizarTranslacao(dadosTranslacao);

                // console.log('onmouseup');
            };
        } else if (interfaceGrafica.telaAtiva === 'rotacao') {
            const pixelsSelecionados = interfaceGrafica.getPixelsSelecionados(x, y);
            const angulo = Number($("#angulo").val());

            interfaceGrafica.realizarRotacao(pixelsSelecionados, {x: x, y: y}, angulo);
        } else if (interfaceGrafica.telaAtiva === 'escala') {
            const pixelsSelecionados = interfaceGrafica.getPixelsSelecionados(x, y);
            const fatorX = Number($("#escalaX").val());
            const fatorY = Number($("#escalaY").val());

            interfaceGrafica.realizarEscala(pixelsSelecionados, {x: x, y: y}, fatorX, fatorY);

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


