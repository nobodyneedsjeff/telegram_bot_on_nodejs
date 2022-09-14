const request = require("request-promise")
const axios=require('axios')
const cheerio=require('cheerio')
const jquery=require('jquery')
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const url = require('url');
const { getClient } = require('./get-client');


// bot token
const token = '*****';

// bot that uses 'polling' to fetch new updates
	const bot = new TelegramBot(token, {polling: true});




bot.onText(/^\/start$/,(msg)=>{ 
//add user to a DB
  (async () => {
  const client = await getClient(); //wait for callback
  const name = process.argv[2] ?? msg.chat.username; //retreive username
  const user_id =process.argv[2] ?? msg.chat.id; //chat id
  const entries = await client.query('SELECT telegram_id FROM users where telegram_id = $1 ;', [user_id] ); // retreive user id 
  const uniquness= entries.rows.map((r) => Object.values(r)) // assign value
  if (msg.chat.id != uniquness){ //check if user id is unique, otherwise, add it into the table
    let insertRow = await client.query('INSERT INTO users(username,telegram_id) VALUES($1,$2);', [`${name} ` , `${user_id}`] );
    //let insertRow = await client.query('INSERT INTO users(username,telegram_id) VALUES($1);', [`${name}`] );
    console.log(`Inserted ${insertRow.rowCount} row`); //log if row is added
    await client.end();
    return 
  }
})();
 
	bot.sendMessage(msg.chat.id, "Здравствуйте. Нажмите на любую интересующую Вас кнопку", { //first message
        "reply_markup": { 
            "inline_keyboard":[  //добавляет клавиатуру в бота
						[ 
						{
						text:"Погода в Канаде",
						callback_data:"canada"
						}]
						,
						[{text:"Хочу почитать!",
						callback_data:"lets_play"
						}]
						,
						[{text:"Cделать рассылку",
						callback_data:"send_messages"
						}]
						],
        },
    });
});
bot.on('message', (msg) => { //  message receiver

  // send a message to the chat acknowledging receipt of their message
  if (msg.text==='1'){
  	bot.sendMessage(msg.chat.id,"ok")
  }
 //console.log(msg)
});
//bot.onText("1",(msg , match)=>{
	//bot.sendMessage(msg.chat.id,'yes')
//})

bot.on("callback_query", (callbackQuery) => { //function to respond to received button
    const msg = callbackQuery.message;
    //console.log(msg.chat.id)
		if (callbackQuery.data==="canada"){
			   	const url = "https://www.timeanddate.com/weather/canada"; //website to scrape
			    //make page load first
			    (async () => {
			     const response = await request({ 
			       uri: url, //website
			       headers: {
			         accept:
			           "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			         //"accept-encoding": "gzip, deflate, br",
			         "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6",
			       },
			       gzip: true, // no idea
			     });
			   
			     let $ = cheerio.load(response);

			     let text=$('#qlook div').text() //.$('.h1 div').text()
        	 let phrase1= text.slice(0,15)
        	 let phrase2=text.slice(15)
			   
			        bot.answerCallbackQuery(callbackQuery.id)
			            .then(() => bot.sendMessage(msg.chat.id, "Weather in " + phrase1 + " is " + phrase2));
			 
			   })()
        }
    else if (callbackQuery.data==="lets_play"){
    	bot.sendPhoto(msg.chat.id, "https://pythonist.ru/wp-content/uploads/2020/03/photo_2021-02-03_10-47-04-350x2000-1.jpg",{caption: "Идеальный карманный справочник для быстрого ознакомления с особенностями работы разработчиков на Python. Вы найдете море краткой информации о типах и операторах в Python, именах специальных методов, встроенных функциях, исключениях и других часто используемых стандартных модулях"})
    	bot.sendDocument(msg.chat.id,"/karmaniy_spravochnik_po_piton.zip")
    }
    else	if (callbackQuery.data==="send_messages"){
    	bot.sendMessage(msg.chat.id,"Вы выбрали рассылку всем пользователям. Вы уверен что хотите это сделать?", {
        "reply_markup": {
            "inline_keyboard":[  //добавляет клавиатуру в бота
						[ 
						{
						text:"Уверен",
						callback_data:"confirmed"
						}]
						,
						[{text:"Отмена!",
						callback_data:"cancel"
						}]
						]}
        },
    )
   


    }
});

 bot.on("callback_query", (callbackQuery) => { //function to respond to received button
    const msg = callbackQuery.message;
    //console.log(msg.chat.id)
		if (callbackQuery.data==="confirmed"){ //what if its agreed to do it
			bot.sendMessage(msg.chat.id,"Какое сообщение вы хотите отправить?")
			stop_listening = false
			bot.on('text',(msg)=>{ // this is not condition, he is listening to commands all the time which is why there is an IF statement. IF its false, it will listen, then turn off
				if ( stop_listening === false){
							(async () => {
							 const client = await getClient(); //wait for callback
							 const entries = await client.query('SELECT telegram_id FROM users ;' ); // retreive user id 
							 const all_users= entries.rows.map((r) => Object.values(r)) // assign value
							 for(let i = 0; i<all_users.length; i++){
								bot.sendMessage(chat_id = Number(all_users[i]), msg.text)
								}
							}
							)();
											bot.sendMessage(msg.chat.id, "Что будем делать теперь?", { //вернуть менюху по завершению
						        "reply_markup": {
						            "inline_keyboard":[  //добавляет клавиатуру в бота
												[ 
												{
												text:"Погода в Канаде",
												callback_data:"canada"
												}]
												,
												[{text:"Хочу почитать!",
												callback_data:"lets_play"
												}]
												,
												[{text:"Cделать рассылку",
												callback_data:"send_messages"
												}]
												],
						        },
						    })
							stop_listening= true // boolean to stop listening for text commands
						}
			 }
			 )
			
		}
		else if (callbackQuery.data=="cancel") //what if its cancelled
		{
				bot.sendMessage(msg.chat.id, "Что желаете сделать?", {
        "reply_markup": {
            "inline_keyboard":[  //добавляет клавиатуру в бота
						[ 
						{
						text:"Погода в Канаде",
						callback_data:"canada"
						}]
						,
						[{text:"Хочу почитать!",
						callback_data:"lets_play"
						}]
						,
						[{text:"Cделать рассылку",
						callback_data:"send_messages"
						}]
						],
        },
    })
		}
	})
bot.on('polling_error', error => console.log(error))