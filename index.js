const puppeteer = require('puppeteer');
var XLSX = require('xlsx');
var workbook = XLSX.readFile('dados.xls');
var worksheet = workbook.Sheets[workbook.SheetNames[0]];
 
var data = [];

var links = ['https://nubank.maxmilhas.com.br/busca-passagens-aereas/RT/XAP/REC/2021-04-10/2021-04-21/2/0/0/EC' ];

rodar(0);
setInterval(() => {
  rodar(0);
}, 60*60*1000);


function rodar(ordem){
// 
	console.log(ordem)
	puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
		
		const page = await browser.newPage();		
		await page.setViewport({width: 1600, height: 1200})
		await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 9_0_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A404 Safari/601.1')

		console.log(ordem+ ": Abriu navegador");
		await page.goto(links[ordem], {waitUntil: 'networkidle0'});
		//await page.goto(links[ordem]);
		await page.waitForSelector('.info');		
		await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
		
		console.log(ordem+ ": Carregou pagina");
		const result = await page.evaluate(() => {
			try {
				function sleep (time) {
					return new Promise((resolve) => setTimeout(resolve, time));
				}

				$('label:contains("Até 1 parada")').first().click();				
				
	
					var data = [];
					var d = new Date();
					d.setHours(d.getHours() - 3);
					d = d.toISOString().replace(/T/, ' ').replace(/\..+/, '');
					
					$('.info').each(function(){
						var ida = $(this).children().first();	
						var volta = $(this).children().first().next()
						
						var ida_titulo = ida.find('.header-stretch').text();
						var ida_empresa = ida.find('.carrier').first().text();
						var ida_detalhes = ida.find('.legs').children().children();
						var ida_horario_saida = ida_detalhes.first().find('strong').text();
						var ida_tempo = ida_detalhes.first().next().text();
						var ida_horario_chegada = ida_detalhes.first().next().next().find('strong').text();
						
						var volta_titulo = volta.find('.header-stretch').text();
						var volta_empresa = volta.find('.carrier').first().text();
						var volta_detalhes = volta.find('.legs').children().children();
						var volta_horario_saida = volta_detalhes.first().find('strong').text();
						var volta_tempo = volta_detalhes.first().next().text();
						var volta_horario_chegada = volta_detalhes.first().next().next().find('strong').text();
					
						var valor = $(this).next().first().children().first().children().first().children().first().next().next().next().next().text()
					
						if(ida_tempo.indexOf("1 parada")>0){
							
							data.push({
								'ida_titulo':ida_titulo,
								'ida_empresa':ida_empresa,
								'ida_horario_saida':ida_horario_saida,
								'ida_tempo':ida_tempo,
								'ida_horario_chegada':ida_horario_chegada,
								'volta_titulo':volta_titulo,
								'volta_empresa':volta_empresa,
								'volta_horario_saida':volta_horario_saida,
								'volta_tempo':volta_tempo,
								'volta_horario_chegada':volta_horario_chegada,
								'valor':valor,
								'consulta':d


							});
							
						}
						
					})
					
					return data;
				
			} catch(err) {
				console.log(err);				
				return [];
			}
		});


        //console.log(result);
        data = [];
		result.forEach(function(v) {data.push(v)});
		console.log(ordem+ ": Carregou Info");

		//await page.screenshot({path: 'exemplo1.png'});
		// let's close the browser
		await browser.close();

		console.log(' ');
		if(ordem < links.length-1){			
			
			ordem++;
			rodar(ordem);
			
		}else{
			ordem++;
			 processa_informacao();
		}
		
		//process.exit();
	}).catch(function(error) {
		console.log(error)
		if(ordem < links.length-1){		
			console.error('Não carregou: '+error);
            console.error('Não carregou: '+ordem);	
            ordem++;	
			rodar(ordem);			
		}		
	});
}
function processa_informacao(){
	
	// ok, let's log blog titles...
	console.log('Processando Info');
	//console.log(data);
	var header = ["ida_titulo", "ida_empresa", "ida_horario_saida", "ida_tempo", "ida_horario_chegada", "volta_titulo", "volta_empresa", "volta_horario_saida", "volta_horario_chegada", "valor","consulta"];	
	XLSX.utils.sheet_add_json(worksheet, data,{ header:header, origin:-1, skipHeader:true});
	
	XLSX.writeFile(workbook, "dados.xls");
	for(var i = 0; i < data.length; i++) {	
		console.log(data[i]);	
	}
	console.log('Processando Info Fim');
	
	
}