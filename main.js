/**
 * ARQUIVO PRINCIPAL DO APP
 * Contém toda a lógica, componentes e simulação de backend.
 */

import React, { useState, useEffect, useCallback } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { Utensils, Clock, Users, RefreshCw, Play, Check, ArrowRight, Coffee, Timer, Info, Download, AlertTriangle, Lock } from 'https://esm.sh/lucide-react@0.263.1';

// --- CONFIGURAÇÕES & TIPOS ---
const QueueStatus = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
  UNKNOWN: 'UNKNOWN'
};

const UserFlowState = {
  IDLE: 'IDLE',
  IN_CASHIER_QUEUE: 'IN_CASHIER_QUEUE',
  BETWEEN_QUEUES: 'BETWEEN_QUEUES',
  IN_ACCESS_QUEUE: 'IN_ACCESS_QUEUE',
  COMPLETED: 'COMPLETED'
};

const APP_CONFIG = {
  MIN_CONTRIBUTORS: 10,
  MAX_VALID_WAIT_TIME_MINUTES: 180,
  REFRESH_RATE_MS: 30000,
};

const STATUS_MESSAGES = {
  [QueueStatus.GREEN]: {
    text: "Fila tranquila!",
    subtext: "Ótimo momento para ir ao RU.",
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    iconColor: "text-green-500"
  },
  [QueueStatus.YELLOW]: {
    text: "Movimento moderado.",
    subtext: "Tempo de espera aceitável.",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-500"
  },
  [QueueStatus.RED]: {
    text: "Fila grande!",
    subtext: "Se puder, espere um pouco.",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500"
  },
  [QueueStatus.UNKNOWN]: {
    text: "Aguardando dados...",
    subtext: "Precisamos de mais colaboradores.",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    iconColor: "text-gray-400"
  }
};

// --- SERVIÇO DE BACKEND (SIMULADO) ---
const generateMockData = () => {
  const now = new Date();
  const hours = now.getHours();
  
  let baseCashierTime = 2;
  let baseAccessTime = 1;
  let activeUsers = Math.floor(Math.random() * 20) + 5;

  // Simulação de horário de pico
  const isLunchPeak = hours >= 11 && hours <= 13;
  const isDinnerPeak = hours >= 17 && hours <= 19;

  if (isLunchPeak) {
    baseCashierTime = 15 + Math.random() * 10;
    baseAccessTime = 5 + Math.random() * 5;
    activeUsers = 80 + Math.floor(Math.random() * 20);
  } else if (isDinnerPeak) {
    baseCashierTime = 10 + Math.random() * 5;
    baseAccessTime = 3 + Math.random() * 3;
    activeUsers = 50 + Math.floor(Math.random() * 20);
  }

  const totalTime = baseCashierTime + baseAccessTime;
  
  let status = QueueStatus.GREEN;
  let message = "Fluxo livre.";

  if (activeUsers < APP_CONFIG.MIN_CONTRIBUTORS) {
    status = QueueStatus.UNKNOWN;
    message = "Dados insuficientes.";
  } else {
    if (totalTime > 20) {
      status = QueueStatus.RED;
      message = "Fila intensa.";
    } else if (totalTime > 10) {
      status = QueueStatus.YELLOW;
      message = "Fluxo moderado.";
    } else {
      status = QueueStatus.GREEN;
      message = "Melhor horário!";
    }
  }

  return {
    cashierWaitTime: baseCashierTime,
    accessWaitTime: baseAccessTime,
    totalWaitTime: totalTime,
    activeContributors: activeUsers,
    status,
    message
  };
};

const fetchQueueStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockData());
    }, 800);
  });
};

const submitQueueEvent = async (stage, durationMinutes) => {
  console.log(`[API] Evento recebido: ${stage}, Duração: ${durationMinutes.toFixed(2)} min`);
  return true;
};

// --- UTILITÁRIOS DE EXPORTAÇÃO ---
const FILES_TO_EXPORT = {
  'manifest.json': JSON.stringify({
    "name": "RU Monitor UFRPE",
    "short_name": "RU Monitor",
    "start_url": ".",
    "display": "standalone",
    "background_color": "#f8fafc",
    "theme_color": "#1e3a8a",
    "orientation": "portrait",
    "icons": [
      { "src": "https://cdn-icons-png.flaticon.com/512/3448/3448609.png", "sizes": "192x192", "type": "image/png" },
      { "src": "https://cdn-icons-png.flaticon.com/512/3448/3448609.png", "sizes": "512x512", "type": "image/png" }
    ]
  }, null, 2),
  'styles.css': `body {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: none;
}
button {
  transition-property: transform, background-color, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
button:active {
  transform: scale(0.98);
}`,
  'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>RU Monitor UFRPE</title>
    <meta name="description" content="Monitore a fila do RU em tempo real.">
    <meta name="theme-color" content="#1e3a8a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="RU Monitor">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/3448/3448609.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-type="module" src="main.js"></script>
  </body>
</html>`
};

const handleExport = async () => {
  if (!window.JSZip) {
    alert("Erro: Biblioteca JSZip não carregada. Atualize a página.");
    return;
  }

  const zip = new window.JSZip();

  // 1. Adicionar arquivos estáticos (HTML, CSS, JSON)
  // Usamos as strings hardcoded para garantir que o zip funcione mesmo se o usuário 
  // não tiver salvo os arquivos locais corretamente ainda.
  zip.file("manifest.json", FILES_TO_EXPORT['manifest.json']);
  zip.file("styles.css", FILES_TO_EXPORT['styles.css']);
  zip.file("index.html", FILES_TO_EXPORT['index.html']);

  // 2. Adicionar main.js (Tenta buscar o atual, senão avisa)
  try {
    const mainJsResponse = await fetch('main.js');
    if (mainJsResponse.ok) {
      const mainJsContent = await mainJsResponse.text();
      zip.file("main.js", mainJsContent);
    } else {
      // Fallback: se não conseguir ler o arquivo (ex: ambiente de preview restrito),
      // avisa o usuário.
      throw new Error("Não foi possível ler main.js");
    }
  } catch (e) {
    alert("Atenção: Não foi possível capturar o código atual de 'main.js' automaticamente. O ZIP conterá apenas HTML/CSS/JSON. Você precisará adicionar o main.js manualmente.");
  }

  // 3. Gerar e baixar
  const content = await zip.generateAsync({ type: "blob" });
  const url = window.URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ru-monitor-deploy.zip";
  a.click();
  window.URL.revokeObjectURL(url);
};

// --- COMPONENTES ---

const Header = ({ onSecretClick }) => (
  <header className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-50 select-none">
    <div className="max-w-md mx-auto flex items-center justify-between">
      <div 
        className="flex items-center space-x-2 cursor-pointer active:opacity-80"
        onClick={onSecretClick}
      >
        <Utensils className="h-6 w-6 text-yellow-400" />
        <div>
          <h1 className="text-lg font-bold leading-none">RU Monitor</h1>
          <p className="text-xs text-blue-200">UFRPE • Colaborativo</p>
        </div>
      </div>
      <div className="text-[10px] bg-blue-800 px-2 py-1 rounded-full animate-pulse font-bold">
        AO VIVO
      </div>
    </div>
  </header>
);

const StatusCard = ({ data, loading, onRefresh }) => {
  if (!data && loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse h-48 flex items-center justify-center">
        <span className="text-gray-400">Carregando dados...</span>
      </div>
    );
  }

  if (!data) return null;

  const config = STATUS_MESSAGES[data.status];
  const isUnknown = data.status === QueueStatus.UNKNOWN;

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${config.bgColor} ${config.borderColor} transition-all duration-500`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className={`text-2xl font-bold ${config.color}`}>{config.text}</h2>
          <p className={`${config.color} opacity-90 text-sm mt-1`}>{config.subtext}</p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={loading}
          className={`p-2 rounded-full hover:bg-white/50 transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className={`h-5 w-5 ${config.iconColor}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-gray-500 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Espera Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {isUnknown ? '--' : `${Math.round(data.totalWaitTime)} min`}
          </p>
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
           <div className="flex items-center space-x-2 text-gray-500 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Online</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {data.activeContributors}
          </p>
        </div>
      </div>
    </div>
  );
};

// Ícone customizado para evitar conflito com import
const UtensilsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
);

const TrackingFlow = ({ onStateChange, onRecordTime }) => {
  const [currentState, setCurrentState] = useState(UserFlowState.IDLE);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (startTime && (currentState === UserFlowState.IN_CASHIER_QUEUE || currentState === UserFlowState.IN_ACCESS_QUEUE)) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, currentState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAction = () => {
    const now = Date.now();

    switch (currentState) {
      case UserFlowState.IDLE:
        setStartTime(now);
        setCurrentState(UserFlowState.IN_CASHIER_QUEUE);
        onStateChange(UserFlowState.IN_CASHIER_QUEUE);
        break;

      case UserFlowState.IN_CASHIER_QUEUE:
        if (startTime) {
          const duration = (now - startTime) / 60000;
          onRecordTime('cashier', duration);
        }
        setStartTime(null);
        setElapsed(0);
        setCurrentState(UserFlowState.BETWEEN_QUEUES);
        onStateChange(UserFlowState.BETWEEN_QUEUES);
        break;

      case UserFlowState.BETWEEN_QUEUES:
        setStartTime(now);
        setCurrentState(UserFlowState.IN_ACCESS_QUEUE);
        onStateChange(UserFlowState.IN_ACCESS_QUEUE);
        break;

      case UserFlowState.IN_ACCESS_QUEUE:
         if (startTime) {
          const duration = (now - startTime) / 60000;
          onRecordTime('access', duration);
        }
        setStartTime(null);
        setElapsed(0);
        setCurrentState(UserFlowState.COMPLETED);
        onStateChange(UserFlowState.COMPLETED);
        break;
      
      case UserFlowState.COMPLETED:
        setCurrentState(UserFlowState.IDLE);
        onStateChange(UserFlowState.IDLE);
        break;
    }
  };

  const getButtonConfig = () => {
    switch (currentState) {
      case UserFlowState.IDLE:
        return {
          text: "Cheguei na Fila do Caixa",
          sub: "Toque para começar a marcar",
          icon: <Play className="w-6 h-6" />,
          color: "bg-blue-600 hover:bg-blue-700",
          active: false
        };
      case UserFlowState.IN_CASHIER_QUEUE:
        return {
          text: "Paguei / Saí do Caixa",
          sub: `Na fila há: ${formatTime(elapsed)}`,
          icon: <Check className="w-6 h-6" />,
          color: "bg-red-500 hover:bg-red-600 animate-pulse",
          active: true
        };
      case UserFlowState.BETWEEN_QUEUES:
        return {
          text: "Entrei na Fila da Catraca",
          sub: "Toque assim que entrar",
          icon: <ArrowRight className="w-6 h-6" />,
          color: "bg-blue-600 hover:bg-blue-700",
          active: false
        };
      case UserFlowState.IN_ACCESS_QUEUE:
        return {
          text: "Passei na Catraca",
          sub: `Na fila há: ${formatTime(elapsed)}`,
          icon: <UtensilsIcon />,
          color: "bg-green-600 hover:bg-green-700 animate-pulse",
          active: true
        };
      case UserFlowState.COMPLETED:
        return {
          text: "Obrigado por ajudar!",
          sub: "Toque para voltar ao início",
          icon: <Coffee className="w-6 h-6" />,
          color: "bg-gray-800 hover:bg-gray-900",
          active: false
        };
      default:
        return { text: "", sub: "", icon: null, color: "" };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mt-6">
      <h3 className="text-gray-900 font-bold mb-4 flex items-center">
        <Timer className="w-5 h-5 mr-2 text-blue-600" />
        Sua contribuição
      </h3>
      
      <button
        onClick={handleAction}
        className={`w-full py-6 px-4 rounded-xl text-white font-bold text-lg shadow-md transition-all transform active:scale-95 flex flex-col items-center justify-center space-y-2 ${config.color}`}
      >
        <div className="flex items-center space-x-2">
          {config.icon}
          <span>{config.text}</span>
        </div>
        <span className="text-sm font-normal opacity-90">{config.sub}</span>
      </button>

      {currentState !== UserFlowState.IDLE && currentState !== UserFlowState.COMPLETED && (
         <div className="mt-4 text-center">
           <button 
             onClick={() => {
               setStartTime(null);
               setCurrentState(UserFlowState.IDLE);
               onStateChange(UserFlowState.IDLE);
             }}
             className="text-gray-400 text-sm underline hover:text-gray-600"
           >
             Cancelar marcação
           </button>
         </div>
      )}
    </div>
  );
};

const App = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState(UserFlowState.IDLE);
  
  // Estado para controlar o clique secreto (Admin)
  const [devClicks, setDevClicks] = useState(0);
  const showDevTools = devClicks >= 5;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchQueueStats();
      setStats(data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (userState === UserFlowState.IDLE) {
        loadData();
      }
    }, APP_CONFIG.REFRESH_RATE_MS);

    return () => clearInterval(interval);
  }, [loadData, userState]);

  const handleRecordTime = async (stage, duration) => {
    await submitQueueEvent(stage, duration);
  };
  
  const handleSecretClick = () => {
    setDevClicks(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 pb-12">
      <Header onSecretClick={handleSecretClick} />
      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* SÓ MOSTRA SE CLICAR 5 VEZES NO TÍTULO */}
        {showDevTools && (
          <div className="bg-indigo-900 rounded-lg p-4 text-white shadow-lg border-2 border-yellow-400/50 animate-pulse">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold flex items-center text-yellow-400">
                <Lock className="w-4 h-4 mr-2" /> 
                Modo Admin
              </h4>
              <button onClick={() => setDevClicks(0)} className="text-xs text-gray-400 hover:text-white">
                Fechar
              </button>
            </div>
            <p className="text-gray-200 text-xs mb-3">
              Ferramenta de deploy visível apenas para você.
            </p>
            <button 
              onClick={handleExport}
              className="w-full bg-yellow-400 text-indigo-900 font-bold py-3 px-4 rounded hover:bg-yellow-300 transition-colors flex items-center justify-center text-sm shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              BAIXAR ARQUIVOS (.ZIP)
            </button>
          </div>
        )}

        <StatusCard data={stats} loading={loading} onRefresh={loadData} />
        <TrackingFlow onStateChange={setUserState} onRecordTime={handleRecordTime} />
        
        <section className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Sistema baseado em <strong>inteligência coletiva</strong>. 
              Sem sensores, apenas colaboração dos alunos.
            </p>
          </div>
        </section>

        <footer className="text-center text-gray-400 text-xs mt-8 space-y-1">
          <p>Projeto Acadêmico - MVP</p>
          <p>Desenvolvido por Tomás Kavela</p>
        </footer>
      </main>
    </div>
  );
};

// Renderização
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);