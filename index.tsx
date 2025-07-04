import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import './index.css';

const playPopupSound = () => {
    const sound = new Audio('https://www.soundjay.com/buttons/sounds/button-19.mp3');
    sound.volume = 1; // Podés ajustar el volumen
    sound.play().catch((e) => console.warn("No se pudo reproducir el sonido:", e));
};

// The 6 projects that will be assigned randomly
const initialProjects = [
  "Turnos Médicos",        
  "Cotizador Viajes",      
  "Agente de Pedidos",      
  "Mozo Multilingüe",     
  "Task Agent",            
  "Asistente Recaudación"  
];

// All 8 projects displayed on the wheel
const wheelProjects = [
    "Turnos Médicos",        
    "Cotizador Viajes", 
    "Bot Instagram Santi",     
    "Agente de Pedidos",      
    "Mozo Multilingüe",  
    "Bot Panchos 314 Market",   
    "Task Agent",            
    "Asistente Recaudación"  
];

const initialGroups = [
  "1- Giorgio, Gambi, Fer",
  "2- Tincho, Bruno G, Tomi",
  "3- JC, Eze, Juani",
  "4- Bebo, Rodri, Flor",
  "5- Joaco, Santi, Mauri",
  "6- Franco S, Nacho L, Agus",
  "7- Franco, Rulo, Juan G"
];

// Spam Popups
const spamPopups = [
    { 
        id: 1, 
        message: 'Gian encontramos cabras sueltas cerca de tu zona, aprovecha...', 
        className: 'popup-gian',
        imageUrl: 'https://cdn.agenciasinc.es/var/ezwebin_site/storage/images/_aliases/img_1col/noticias/las-cabras-trepadoras-dispersan-las-semillas-de-los-arboles-escupiendo/5992199-1-esl-MX/Las-cabras-trepadoras-dispersan-las-semillas-de-los-arboles-escupiendo.jpg'
    },
    { 
        id: 2, 
        message: 'Marcos encontramos enanas maduras que tanto deseabas a 5 km', 
        className: 'popup-marcos',
        imageUrl: 'https://media.c5n.com/p/08bbb79c18077186c73a4efe9e2752c8/adjuntos/326/imagenes/000/067/0000067423/790x0/smart/little-britneyjpgjpg.jpg'
    },
    { 
        id: 3, 
        message: 'Tomás una otaku espera por ti', 
        className: 'popup-tomas',
        imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjaCoVLPhCSpsINe_osDZSGhiZ5o7KZwEUGeXGY8LsW7x38PRM4hNGzS_V1AkkTJze1boFn8XWt413cuYK216KDbiUGEMR1OvYzE9Uqi8WzvFux2N_r8FuH-B-vWd0fRiLk9R2-3PlQrwYq/s1600/20130519otaku.jpg'
    }
];

const CountdownTimer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(now);
            target.setHours(17, 30, 0, 0); // Set target to 5:30 PM today

            // If it's past 5:30 PM today, set the target for tomorrow
            if (now.getTime() > target.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            const difference = target.getTime() - now.getTime();
            
            const hours = Math.floor((difference / (1000 * 60 * 60)));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return {
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0'),
            };
        };
        
        // Initial calculation to avoid 1-second delay
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="countdown-timer" aria-label="Cuenta regresiva para las 17:30">
            <div className="countdown-segment">
                <span className="countdown-number">{timeLeft.hours}</span>
                <span className="countdown-label">Horas</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-segment">
                <span className="countdown-number">{timeLeft.minutes}</span>
                <span className="countdown-label">Minutos</span>
            </div>
            <div className="countdown-separator">:</div>
            <div className="countdown-segment">
                <span className="countdown-number">{timeLeft.seconds}</span>
                <span className="countdown-label">Segundos</span>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [assignments, setAssignments] = useState<{ group: string; project: string }[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [flickeringIndices, setFlickeringIndices] = useState(new Set<number>());
    const [activePopup, setActivePopup] = useState<(typeof spamPopups)[0] | null>(null);
    const popupTimerRef = useRef<number | null>(null);

    // Effect for the flickering title
    useEffect(() => {
        const title = "HACKATON";
        const intervalId = setInterval(() => {
            const newFlickeringIndices = new Set<number>();
            const flickerCount = Math.floor(Math.random() * 2) + 1; // Flicker 1 or 2 letters

            for (let i = 0; i < flickerCount; i++) {
                const randomIndex = Math.floor(Math.random() * title.length);
                newFlickeringIndices.add(randomIndex);
            }
            
            setFlickeringIndices(newFlickeringIndices);
        }, 400); // Change flicker state every 400ms

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    // Effect for spam popups
    useEffect(() => {
        const scheduleNextPopup = () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
            const randomInterval = Math.random() * (20000 - 10000) + 10000;
            popupTimerRef.current = window.setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * spamPopups.length);
                playPopupSound();
                setActivePopup(spamPopups[randomIndex]);
            }, randomInterval);
        };

        scheduleNextPopup();
        return () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
        };
    }, []);

    const handleClosePopup = () => {
        setActivePopup(null);
         const scheduleNextPopup = () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
            }
            const randomInterval = Math.random() * (20000 - 10000) + 10000;
            popupTimerRef.current = window.setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * spamPopups.length);
                setActivePopup(spamPopups[randomIndex]);
            }, randomInterval);
        };
        scheduleNextPopup();
    };

    const availableProjects = useMemo(() => 
        initialProjects.filter(p => !assignments.some(a => a.project === p)),
        [assignments]
    );

    const isFinished = assignments.length === initialGroups.length;
    const isLastGroupTurn = currentGroupIndex === initialGroups.length - 1;

    const handleSpin = () => {
        // For the last group, exclude "Mozo Multilingüe" and "Agente de Pedidos"
        // For all other groups, it's the projects that haven't been assigned yet.
        let projectsToSpin;
        if (isLastGroupTurn) {
            projectsToSpin = initialProjects.filter(project => 
                project !== "Mozo Multilingüe" && project !== "Agente de Pedidos"
            );
        } else {
            projectsToSpin = availableProjects;
        }

        if (isSpinning || isFinished || projectsToSpin.length === 0) return;

        setIsSpinning(true);

        const projectIndex = Math.floor(Math.random() * projectsToSpin.length);
        const selectedProject = projectsToSpin[projectIndex];
        
        const selectedGroup = initialGroups[currentGroupIndex];

        const originalProjectIndex = wheelProjects.findIndex(p => p === selectedProject);
        const segmentAngle = 360 / wheelProjects.length;
        const randomSpins = Math.floor(Math.random() * 4) + 5; 
        
        const targetAngle = (originalProjectIndex * segmentAngle) + (segmentAngle / 2);
        const newRotation = (randomSpins * 360) + (rotation - (rotation % 360)) - targetAngle;

        setRotation(newRotation);

        setTimeout(() => {
            setAssignments(prev => [...prev, { group: selectedGroup, project: selectedProject }]);
            setIsSpinning(false);
            setCurrentGroupIndex(prev => prev + 1);
        }, 5000); // This duration must match the CSS transition duration
    };

    const handleReset = () => {
        setAssignments([]);
        setRotation(0);
        setIsSpinning(false);
        setCurrentGroupIndex(0);
    };

    const handleDownloadExcel = () => {
        // The first element is an empty string to leave column A blank.
        // Subsequent elements are the assignments formatted as "Group: Project".
        const rowData = ["", ...assignments.map(
            ({ group, project }) => `${group}: ${project}`
        )];

        // Create a worksheet from an array of arrays. This creates a single row.
        const worksheet = XLSX.utils.aoa_to_sheet([rowData]);

        // Calculate column widths to fit the content.
        // Give column A a minimum width, and other columns width based on their content length.
        const colWidths = rowData.map(cellContent => ({ 
            wch: cellContent.length > 0 ? cellContent.length + 2 : 8 
        }));
        worksheet["!cols"] = colWidths;

        // Create a new workbook and append the sheet.
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Asignaciones');

        // Trigger the file download.
        XLSX.writeFile(workbook, 'asignaciones.xlsx');
    };

    const numProjects = wheelProjects.length;
    const segmentAngle = 360 / numProjects;

    return (
        <div className="app">
            <header className="app-header">
                <img src="https://merovingiandata.com/hs-fs/hubfs/logo-merovingian-horizontal-white-2.png?width=350&height=70&name=logo-merovingian-horizontal-white-2.png" alt="Merovingian Data Logo" className="logo" />
                <div className="header-title">
                    {"HACKATON".split('').map((char, index) => (
                        <span key={index} className={flickeringIndices.has(index) ? 'flicker' : ''}>
                            {char}
                        </span>
                    ))}
                </div>
                <CountdownTimer />
            </header>
            <h1 className="page-title">Ruleta de Proyectos</h1>

            <div className="main-content">
                <div className="left-column">
                    <aside className="panel">
                        <h2>Grupos</h2>
                        <ul className="list">
                            {initialGroups.map((group, index) => {
                                const isAssigned = assignments.some(a => a.group === group);
                                const isCurrent = index === currentGroupIndex && !isFinished;
                                
                                let className = 'list-item';
                                if (isAssigned) {
                                    className += ' assigned';
                                } else if (isCurrent) {
                                    className += ' current';
                                }

                                return (
                                    <li key={group} className={className}>
                                        {group}
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    <aside className="panel">
                        <h2>Proyectos</h2>
                        <ul className="list">
                            {wheelProjects.map(project => {
                                 const isAssigned = assignments.some(a => a.project === project);
                                 return (
                                    <li key={project} className={`list-item ${isAssigned ? 'assigned' : ''}`}>
                                        {project}
                                    </li>
                                 );
                            })}
                        </ul>
                    </aside>
                </div>

                <div className="center-column">
                    {!isFinished && (
                        <main className="roulette-container">
                            <div className="pointer"></div>
                            <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                                <div className="wheel-center"></div>
                                {wheelProjects.map((project, index) => {
                                    const textRotation = (index * segmentAngle) + (segmentAngle / 2);
                                    return (
                                        <div key={project} className="segment-label" style={{ transform: `rotate(${textRotation}deg)` }}>
                                            <div className="segment-text">
                                                {project}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </main>
                    )}
                    
                    <div className="controls">
                        {isFinished ? (
                            <div className="finished-controls">
                                <button className="button reset-button" onClick={handleReset} aria-label="Reiniciar la ruleta">
                                    Reiniciar
                                </button>
                                <button className="button download-button" onClick={handleDownloadExcel} aria-label="Descargar resultados en Excel">
                                    Descargar Excel
                                </button>
                            </div>
                        ) : (
                            <button className="button spin-button" onClick={handleSpin} disabled={isSpinning} aria-label="Girar la ruleta">
                                {isSpinning ? 'Girando...' : 'Girar'}
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="right-column">
                    <aside className="results-panel panel" aria-live="polite">
                        <h2>Asignaciones</h2>
                        {assignments.length > 0 ? (
                            <ul className="assignments-list">
                                {assignments.map(({ group, project }) => (
                                    <li key={`${group}-${project}`} className="assignment-item">
                                        <strong>{group}:</strong> {project}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                           <p className="no-results-text">Gira la ruleta para empezar a asignar proyectos.</p>
                        )}
                    </aside>
                </div>
            </div>

            {activePopup && (
                <div className={`popup ${activePopup.className}`}>
                    <button onClick={handleClosePopup} className="popup-close" aria-label="Cerrar">&times;</button>
                    <div className="popup-body">
                         <img src={activePopup.imageUrl} alt="" className="popup-image" />
                         <p>{activePopup.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
