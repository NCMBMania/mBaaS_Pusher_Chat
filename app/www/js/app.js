// This is a JavaScript file
let pusher;
let ncmb;
const pusherId = 'YOUR_PUSHER_ID';
const applicationKey = 'YOUR_APPLICATION_KEY';
const clientKey = 'YOUR_CLIENT_KEY';

// グローバル変数の処理
ons.ready(function() {
  pusher = new Pusher(pusherId, {
    encrypted: true
  });
  ncmb = new NCMB(applicationKey, clientKey);
});

// 初期表示処理
$(document).on('init', (event) => {
  if (event.target.id === 'login') {
    $('#chatId').val('channel');
    const userName = localStorage.getItem('userName');
    if (userName)
      $('#userName').val(userName);
  }
});

// チャット画面を表示したときの処理
$(document).on('show', (event) => {
  if (event.target.id === 'chat') {
    const data = event.target.data;
    $('#channelId').val(data.chatId);
    connectPusher(data.userName, data.chatId);
    loadChat(data.userName, data.chatId);
  }
});

// チャット画面から戻った時の処理
$(document).on('hide', (event) => {
  if (event.target.id === 'chat') {
    pusher.unsubscribe($('#channelId').val());
  }
});

// チャットルームにログインする処理
const join = () => {
  const userName = $('#userName').val();
  if (userName === '') {
    ons.notification
      .alert('ユーザ名を決めてください');
    return;
  }
  localStorage.setItem('userName', userName);
  const chatId = $('#chatId').val();
  $('#nav')[0].pushPage('chat.html', {
    data: { userName, chatId }
  })
}

// Pusherに接続する処理
const connectPusher = (userName, chatId) => {
  const channel = pusher.subscribe(chatId);
  channel.bind('message', function(data) {
    showChat(userName, data);
  });
};

// 既存のチャットメッセージを読み込む処理
const loadChat = (userName, channel) => {
  const Chat = ncmb.DataStore('Chat');
  Chat
    .equalTo('channel', channel)
    .fetchAll()
    .then(chats => {
      for (let chat of chats) {
        showChat(userName, chat);
      }
    });
}

// メッセージを一つ表示する処理
const showChat = (userName, data) => {
  if (data.userName == userName) {
    $('#chats').append(`
      <ons-list-item modifier="nodivider">
        <div class="right">
          <ons-button style="background-color: green">${data.message}</ons-button>
        </div>
      </ons-list-item>`);
  }else{
    $('#chats').append(`
      <ons-list-item modifier="nodivider">
        <ons-button>${data.message}</ons-button>
        <span class="list-item__subtitle">${data.userName}</span>
      </ons-list-item>`);
  }
}

// メッセージ送信処理
const send = () => {
  const message = $('#message').val();
  const userName = localStorage.getItem('userName');
  const channel  = $('#channelId').val();
  ncmb.Script
      .data({
        userName,
        message,
        channel
      })
      .exec("POST", "push.js")
      .then(function(res){
        $('#message').val('');
      })
      .catch(function(err){
      });
};
