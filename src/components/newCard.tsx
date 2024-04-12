/* eslint-disable react/react-in-jsx-scope */
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewCardProps{
	onNoteCreated: (Content: string)=> void
}

let speechRecognition: SpeechRecognition | null = null;

export function NewCard({onNoteCreated}: NewCardProps){

	const [shouldShowOnBording, setShouldShowOnBording] =  useState(true);
	const [content, setContent] = useState("");
	const [isRecording, setIsRecording] = useState(false);

	{/*função para abrir o textbox ao clicar em utilize apenas texto */}
	function handleStartEditor(){
		setShouldShowOnBording(false);
	}

	{/*função para fechar o textbox ao apagar todo o texto */}
	function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>){

		setContent(event.target.value);

		if(event.target.value == "") {
			
			setShouldShowOnBording(true);
		}
	}
	

	{/* função para que o From não feche ao clicar em salvar */}
	function handleSaveNote(event: FormEvent){

		if(content == ""){
			return;
		}
		
		event.preventDefault();

		onNoteCreated(content);

		setContent("");

		setShouldShowOnBording(true);

		toast.success("Nota criada com sucesso");
	}

	function handleStartRec(){
		

		const isSpeechRecognitionAPIAvaliable = 
			"SpeechRecognition" in window || "webkitSpeechRecognition" in window;

		if(!isSpeechRecognitionAPIAvaliable){
			alert("infelizmente seu navegador não suporta a API de gravação");
			return;
		}
		setIsRecording(true);
		setShouldShowOnBording(false);

		const speechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

		speechRecognition = new speechRecognitionAPI();

		speechRecognition.lang = "pt-BR";

		speechRecognition.continuous = true;

		speechRecognition.maxAlternatives = 1;
		
		speechRecognition.interimResults = true;

		speechRecognition.onresult = (event) => {
			const transcription = Array.from(event.results).reduce((text, result) => {
				return text.concat(result[0].transcript);
			}, "");
			setContent(transcription);
		};

		
		speechRecognition.onerror = (event)=> {
			console.error(event);
		};
		
		
		speechRecognition.start();
	}

	function handleStopRec() {
		setIsRecording(false);
	
		if (speechRecognition !== null) {
			speechRecognition.stop();
		}
	}
	
	return(

		<Dialog.Root>
			<Dialog.Trigger className="flex flex-col rounded-md bg-slate-700 p-5 gap-3 text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">

				<span className="text-sm font-medium text-slate-200">
                    Adicionar nota
				</span>

				<p className="text-sm leading-6 text-slate-400">
                    Grave uma nota em áudio que será convertida para texto automaticamente.
				</p>

			</Dialog.Trigger>
			<Dialog.Portal>

				<Dialog.Overlay className="inset-0 bg-black/50 fixed"/>

				<Dialog.Content className="overflow-hidden z-10 fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
					
					<Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
						<X className="size-5"/>	
					</Dialog.Close>

					<form className="flex-1 flex flex-col">
						<div className="flex flex-1 flex-col gap-3 p-5">
							<span className="text-sm font-medium text-slate-300">
							Adicionar nota
							</span>

							{shouldShowOnBording ? (
								<p className="text-sm leading-6 text-slate-400">
                            Comece <button type="button" onClick={handleStartRec} className="font-medium text-lime-400 hover:underline">gravando uma nota </button> em áudio ou se preferir <button type="button" onClick={handleStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
								</p>
							) : (
								<textarea 
									autoFocus
									className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
									onChange={handleContentChanged}
									value={content}
								>

								</textarea>
							)}
						
						</div>
						{isRecording ? (
							<button 
								type="button"
								onClick={handleStopRec}
								className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
							>
								<div className="size-3 rounded-full bg-red-500 animate-pulse"/>
								Gravando! (clique para interromper)
							</button>
						):(
							<button 
								type="button"
								onClick={handleSaveNote}
								className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
							>
								Salvar nota
							</button>
						)
						}
						

					</form>
				</Dialog.Content>

			</Dialog.Portal>
		</Dialog.Root>
		
	);
}