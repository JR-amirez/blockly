import {
  IonBadge,
  IonButton,
  IonCard,
  IonChip,
  IonContent,
  IonIcon,
  IonPage,
  IonPopover,
} from "@ionic/react";
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  exitOutline,
  homeOutline,
  informationCircleOutline,
  pauseCircleOutline,
  playCircleOutline,
  refresh,
  time,
} from "ionicons/icons";
import "./Home.css";
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  BlocklyWorkspace,
  BlocklyWorkspaceHandle,
  type ExerciseIndicator,
} from "../components/blockly";
import { App } from "@capacitor/app";

type Difficulty = "basic" | "intermediate" | "advanced";

export interface PlayProps {
  difficulty?: Difficulty;
}

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
};

type BlocklyRuntimeConfig = {
  nivel?: string;
  autor?: string;
  version?: string;
  fecha?: string;
  descripcion?: string;
  nombreApp?: string;
  plataformas?: string[];
};

const TIME_LIMIT_BY_LEVEL: Record<Difficulty, number> = {
  basic: 600,        // 10 minutos
  intermediate: 900, // 15 minutos
  advanced: 1200,    // 20 minutos
};

const Home: React.FC<PlayProps> = ({ difficulty = "basic" }) => {
  const blocklyRef = useRef<BlocklyWorkspaceHandle>(null);
  const [showStartScreen, setShowStartScreen] = useState<boolean>(true);
  const [appNombreJuego, setAppNombreJuego] = useState<string>("STEAM-G");
  const [difficultyConfig, setDifficultyConfig] =
    useState<Difficulty>(difficulty);
  const [showInformation, setShowInformation] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(5);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [appDescripcion, setAppDescripcion] = useState<string>(
    "Juego para el desarrollo de habilidades matemáticas",
  );
  const [appFecha, setAppFecha] = useState<string>("2 de Diciembre del 2025");
  const [appVersion, setAppVersion] = useState<string>("1.0");
  const [appPlataformas, setAppPlataformas] = useState<string>("android");
  const [appAutor, setAppAutor] = useState<string>("Valeria C. Z.");
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [pausado, setPausado] = useState<boolean>(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(
    null,
  );
  const [isComplete, setisComplete] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [configLoaded, setConfigLoaded] = useState<boolean>(false);
  const [totalExercises, setTotalExercises] = useState<number>(0);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [showTimeUp, setShowTimeUp] = useState<boolean>(false);
  const [puntuacionTotal, setPuntuacionTotal] = useState(0);
  const [exerciseIndicator, setExerciseIndicator] =
    useState<ExerciseIndicator | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const lastExerciseIndex = useRef<number>(-1);

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const res = await fetch("/config/bloques-config.json");

        if (!res.ok) {
          setConfigLoaded(true);
          return;
        }

        const data: BlocklyRuntimeConfig = await res.json();

        if (data.nivel) {
          setDifficultyConfig(normalizarNivelConfig(data.nivel));
        }

        if (data.autor) setAppAutor(data.autor);
        if (data.version) setAppVersion(data.version);
        if (data.fecha) setAppFecha(formatearFechaLarga(data.fecha));
        if (data.descripcion) setAppDescripcion(data.descripcion);
        if (data.plataformas) setAppPlataformas(data.plataformas.join(", "));
        if (data.nombreApp) setAppNombreJuego(data.nombreApp);
      } catch (err) {
        console.error("No se pudo cargar bloques-config.json", err);
      } finally {
        setConfigLoaded(true);
      }
    };

    cargarConfig();

    fetch("/data/exercises.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.exercises)) {
          setTotalExercises(data.exercises.length);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      setTimeout(() => {
        setShowCountdown(false);
      }, 500);
    }
  }, [countdown, showCountdown]);

  // Temporizador del juego
  useEffect(() => {
    if (showStartScreen || showCountdown || isPaused || pausado || isVerifying || showSummary || showTimeUp || tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const isLast = exerciseIndicator
            ? exerciseIndicator.currentIndex >= exerciseIndicator.total - 1
            : true;

          if (isLast) {
            setShowSummary(true);
          } else {
            setShowTimeUp(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showStartScreen, showCountdown, isPaused, pausado, isVerifying, showSummary, showTimeUp, tiempoRestante, exerciseIndicator, difficultyConfig]);

  // Overlay de tiempo agotado: 3 segundos y pasa al siguiente ejercicio
  useEffect(() => {
    if (!showTimeUp) return;

    const timeout = setTimeout(() => {
      setShowTimeUp(false);
      blocklyRef.current?.nextExercise();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showTimeUp]);

  const getDifficultyLabel = (nivel: Difficulty): string => {
    const labels: Record<Difficulty, string> = {
      basic: "Básico",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    };
    return labels[nivel] ?? nivel;
  };

  const generarConfeti = (cantidad = 60): ConfettiPiece[] => {
    const colores = ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1", "#5f27cd"];

    return Array.from({ length: cantidad }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2.5,
      color: colores[Math.floor(Math.random() * colores.length)],
    }));
  };

  const formatPlataforma = (texto: string): string => {
    const mapa: Record<string, string> = {
      android: "Android",
      ios: "iOS",
      web: "Web",
    };
    return texto
      .split(/,\s*/)
      .map(
        (p) => mapa[p.toLowerCase()] ?? p.charAt(0).toUpperCase() + p.slice(1),
      )
      .join(", ");
  };

  const normalizarNivelConfig = (nivel: string): Difficulty => {
    const limpio = nivel.toLowerCase();
    const mapa: Record<string, Difficulty> = {
      basico: "basic",
      basic: "basic",
      intermedio: "intermediate",
      intermediate: "intermediate",
      avanzado: "advanced",
      advanced: "advanced",
    };
    return mapa[limpio] ?? "basic";
  };

  const formatearFechaLarga = (isoDate?: string) => {
    if (!isoDate) return appFecha;
    const [year, month, day] = isoDate.split("-");
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    const mesIndex = Number(month) - 1;
    if (mesIndex < 0 || mesIndex > 11) return isoDate;

    return `${Number(day)} de ${meses[mesIndex]} del ${year}`;
  };

  const handleSalirDesdePausa = () => {
    setPausado(false);
    setIsPaused(false);
    handleExitToStart();
  };

  const handleExitApp = async () => {
    try {
      await App.exitApp();
    } catch (e) {
      window.close();
    }
  };

  const handleStartGame = () => {
    setShowStartScreen(false);
    setTiempoRestante(TIME_LIMIT_BY_LEVEL[difficultyConfig]);
    resetGame();
  };

  const handleInformation = () => {
    setShowInformation(!showInformation);
  };

  const handlePausar = () => {
    if (
      showStartScreen ||
      showCountdown ||
      showSummary ||
      showInstructions ||
      showFeedback ||
      pausado
    )
      return;

    setPausado(true);
    setIsPaused(true);
  };

  const handleResume = () => {
    setShowExitModal(false);
    setIsPaused(false);
    setPausado(false);
  };

  const handleExitToStart = () => {
    setShowExitModal(false);

    setIsPaused(false);

    setShowCountdown(false);
    setShowInstructions(false);
    setShowSummary(false);
    setShowFeedback(false);
    setExerciseIndicator(null);
    setPuntuacionTotal(0);

    setShowStartScreen(true);
  };

  const resetGame = () => {
    setCountdown(5);
    setShowCountdown(true);
    setActiveButtonIndex(null);
    setisComplete(true);
    setScore(0);
    setPuntuacionTotal(0);
    setExerciseIndicator(null);
  };

  const handleExerciseChange = useCallback((indicator: ExerciseIndicator) => {
    setExerciseIndicator(indicator);
    setPuntuacionTotal(indicator.score);
    // Solo resetear el tiempo cuando cambia el ejercicio, no cuando cambia isCorrect
    if (indicator.currentIndex !== lastExerciseIndex.current) {
      lastExerciseIndex.current = indicator.currentIndex;
      setTiempoRestante(TIME_LIMIT_BY_LEVEL[difficultyConfig]);
    }
  }, [difficultyConfig]);

  const handleVerifyExercise = useCallback(() => {
    blocklyRef.current?.verifyExercise();
  }, []);

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.max(0, segundos % 60);
    return `${minutos}:${segs.toString().padStart(2, "0")}`;
  };

  return (
    <IonPage>
      {showCountdown && countdown > 0 && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdown}</div>
        </div>
      )}

      {showFeedback && (
        <div className="feedback-overlay">
          <div className="feedback-text">{feedbackMessage}</div>
        </div>
      )}

      {showTimeUp && (
        <div className="timeup-overlay">
          <div className="timeup-content">
            <IonIcon icon={time} className="timeup-icon" />
            <h2>Tiempo agotado</h2>
            <p>Pasando al siguiente ejercicio...</p>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="summary-overlay">
          <div className="summary-message">
            {(() => {
              const total = 0;
              const correctas = 0;
              const incorrectas = Math.max(total - correctas, 0);
              const porcentaje =
                total > 0 ? Math.round((correctas / total) * 100) : 0;
              const etiqueta =
                correctas === total
                  ? "¡PERFECTO! 🏆"
                  : porcentaje >= 70
                    ? "¡Excelente! 🔥"
                    : porcentaje >= 50
                      ? "¡Buen trabajo! 👍"
                      : "¡Sigue practicando! 💪";

              return (
                <>
                  <h2>Juego Terminado</h2>

                  <div className="resumen-final">
                    <h3>Resultados Finales</h3>

                    <p>
                      <strong>Ejercicios completados:</strong> {total}
                    </p>
                    <p>
                      <strong>Correctos:</strong> {correctas}
                    </p>
                    <p>
                      <strong>Incorrectos:</strong> {incorrectas}
                    </p>
                    <p>
                      <strong>Puntuación total:</strong> {score} / {maxScore}
                    </p>

                    <IonBadge className="badge">{etiqueta}</IonBadge>
                  </div>

                  <IonButton
                    id="finalize"
                    expand="block"
                    onClick={handleSalirDesdePausa}
                  >
                    <IonIcon icon={refresh} slot="start" />
                    Jugar de Nuevo
                  </IonButton>

                  <IonButton id="exit" expand="block" onClick={handleExitApp}>
                    <IonIcon slot="start" icon={exitOutline}></IonIcon>
                    Cerrar aplicación
                  </IonButton>
                </>
              );
            })()}
          </div>

          <div className="confetti-container">
            {generarConfeti().map((c) => (
              <div
                key={c.id}
                className="confetti"
                style={{
                  left: `${c.left}%`,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.duration}s`,
                  backgroundColor: c.color,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {showInstructions && (
        <div className="ins-overlay" onClick={() => setShowInstructions(false)}>
          <div className="ins-card" onClick={(e) => e.stopPropagation()}>
            <div className="ins-title">
              <h2
                style={{ margin: 0, fontWeight: "bold", color: "var(--dark)" }}
              >
                Reglas Básicas
              </h2>
              <IonIcon
                icon={closeCircleOutline}
                style={{ fontSize: "26px", color: "var(--dark)" }}
                onClick={() => setShowInstructions(false)}
              />
            </div>

            <div className="ins-stats">
              <p style={{ textAlign: "justify" }}>
                <strong>
                  Crea una función usando los bloques de programación. La
                  función debe resolver el problema indicado. Usa el bloque
                  "Imprimir" para mostrar el resultado. Luego presiona
                  "Verificar" para ejecutar las pruebas automáticas. Si todas
                  las pruebas pasan, ganarás 10 puntos.
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {showInformation && (
        <div className="info-modal-background">
          <div className="info-modal">
            <div className="header">
              <h2 style={{ color: "var(--color-primary)", fontWeight: "bold" }}>
                {appNombreJuego}
              </h2>
              <p
                style={{
                  color: "#8b8b8bff",
                  marginTop: "5px",
                  textAlign: "center",
                }}
              >
                Actividad configurada desde la plataforma Steam-G
              </p>
            </div>
            <div className="cards-info">
              <div className="card">
                <p className="title">VERSIÓN</p>
                <p className="data">{appVersion}</p>
              </div>
              <div className="card">
                <p className="title">FECHA DE CREACIÓN</p>
                <p className="data">{appFecha}</p>
              </div>
              <div className="card">
                <p className="title">PLATAFORMAS</p>
                <p className="data">{formatPlataforma(appPlataformas)}</p>
              </div>
              <div className="card">
                <p className="title">NÚMERO DE EJERCICIOS</p>
                <p className="data">{totalExercises}</p>
              </div>
              <div className="card description">
                <p className="title">DESCRIPCIÓN</p>
                <p className="data">{appDescripcion}</p>
              </div>
            </div>
            <div className="button">
              <IonButton expand="full" onClick={handleInformation}>
                Cerrar
              </IonButton>
            </div>
          </div>
        </div>
      )}

      {pausado && (
        <div className="pause-overlay">
          <div className="pause-card">
            <h2>Juego en pausa</h2>
            <p>El tiempo está detenido.</p>

            <IonButton
              expand="block"
              id="resume"
              style={{ marginTop: "16px" }}
              onClick={handleResume}
            >
              <IonIcon slot="start" icon={playCircleOutline}></IonIcon>
              Reanudar
            </IonButton>

            <IonButton
              expand="block"
              id="finalize"
              style={{ marginTop: "10px" }}
              onClick={handleSalirDesdePausa}
            >
              <IonIcon slot="start" icon={homeOutline}></IonIcon>
              Finalizar juego
            </IonButton>

            <IonButton
              expand="block"
              id="exit"
              style={{ marginTop: "10px" }}
              onClick={handleExitApp}
            >
              <IonIcon slot="start" icon={exitOutline}></IonIcon>
              Cerrar aplicación
            </IonButton>
          </div>
        </div>
      )}

      <IonContent fullscreen className="ion-padding">
        {showStartScreen ? (
          <div className="inicio-container">
            <div className="header-game ion-no-border">
              <div className="toolbar-game">
                <div className="titles start-page">
                  <h1>{appNombreJuego}</h1>
                </div>
              </div>
            </div>

            <div className="info-juego">
              <div className="info-item">
                <IonChip>
                  <strong>Nivel: {getDifficultyLabel(difficultyConfig)}</strong>
                </IonChip>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              className="page-start-btns"
            >
              <IonButton onClick={handleStartGame} className="play">
                <IonIcon slot="start" icon={playCircleOutline}></IonIcon>
                Iniciar juego
              </IonButton>
              <IonButton onClick={handleInformation} className="info">
                <IonIcon slot="start" icon={informationCircleOutline}></IonIcon>
                Información
              </IonButton>
            </div>
          </div>
        ) : (
          <div className="game-active-container">
            <div className="header-game ion-no-border">
              <div className="toolbar-game">
                <div className="titles">
                  <h1>STEAM-G</h1>
                  <IonIcon
                    icon={alertCircleOutline}
                    size="small"
                    id="info-icon"
                  />
                  <IonPopover
                    trigger="info-icon"
                    side="bottom"
                    alignment="center"
                  >
                    <IonCard className="filter-card ion-no-margin">
                      <div className="section header-section">
                        <h2>{appNombreJuego}</h2>
                      </div>

                      <div className="section description-section">
                        <p>{appDescripcion}</p>
                      </div>

                      <div className="section footer-section">
                        <span>{appFecha}</span>
                      </div>
                    </IonCard>
                  </IonPopover>
                </div>
                <span>
                  <strong>{appNombreJuego}</strong>
                </span>
              </div>
            </div>

            <div className="instructions-exercises">
              <div className="num-words">
                <strong>
                  {exerciseIndicator?.exercise
                    ? `Juego ${exerciseIndicator.currentIndex + 1} de ${exerciseIndicator.total}`
                    : "Cargando ejercicio..."}
                </strong>
              </div>

              <div className="temporizador">
                <IonIcon icon={time} className="icono-tiempo" />
                <h5 className="tiempo-display">
                  {formatearTiempo(tiempoRestante)}
                </h5>
              </div>

              <div className="num-words">
                <strong>Puntuación: {puntuacionTotal}</strong>
              </div>

              <div className="num-words rules" onClick={() => setShowInstructions(true)}>
                Reglas Básicas
              </div>
            </div>

            <div className="videogame">
              <BlocklyWorkspace
                ref={blocklyRef}
                difficulty={difficultyConfig}
                onComplete={(finalScore) => {
                  setPuntuacionTotal(finalScore);
                  setShowSummary(true);
                }}
                onExerciseChange={handleExerciseChange}
                onVerifying={setIsVerifying}
                isPaused={isPaused || pausado || showCountdown}
              />
            </div>

            <div className="button game">
              <IonButton
                shape="round"
                expand="full"
                onClick={handleVerifyExercise}
                disabled={
                  showCountdown ||
                  showSummary ||
                  showInstructions ||
                  isPaused ||
                  pausado ||
                  !exerciseIndicator?.exercise
                }
              >
                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                Verificar
              </IonButton>
              <IonButton
                shape="round"
                expand="full"
                onClick={handlePausar}
                disabled={
                  showCountdown ||
                  showFeedback ||
                  showSummary ||
                  showInstructions ||
                  pausado ||
                  activeButtonIndex !== null ||
                  !isComplete
                }
              >
                <IonIcon slot="start" icon={pauseCircleOutline} />
                Pausar
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
