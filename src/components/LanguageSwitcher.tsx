import { useState, useRef, useEffect } from "react";
import { Globe, Search, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
	{ code: "af", name: "Afrikaans" },
	{ code: "sq", name: "Albanian" },
	{ code: "am", name: "Amharic" },
	{ code: "ar", name: "Arabic", flag: "🇸🇦" },
	{ code: "hy", name: "Armenian" },
	{ code: "az", name: "Azerbaijani" },
	{ code: "eu", name: "Basque" },
	{ code: "be", name: "Belarusian" },
	{ code: "bn", name: "Bengali" },
	{ code: "bs", name: "Bosnian" },
	{ code: "bg", name: "Bulgarian" },
	{ code: "ca", name: "Catalan" },
	{ code: "ceb", name: "Cebuano" },
	{ code: "ny", name: "Chichewa" },
	{ code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳" },
	{ code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼" },
	{ code: "co", name: "Corsican" },
	{ code: "hr", name: "Croatian" },
	{ code: "cs", name: "Czech" },
	{ code: "da", name: "Danish" },
	{ code: "nl", name: "Dutch", flag: "🇳🇱" },
	{ code: "en", name: "English", flag: "🇬🇧" },
	{ code: "eo", name: "Esperanto" },
	{ code: "et", name: "Estonian" },
	{ code: "tl", name: "Filipino" },
	{ code: "fi", name: "Finnish" },
	{ code: "fr", name: "French", flag: "🇫🇷" },
	{ code: "fy", name: "Frisian" },
	{ code: "gl", name: "Galician" },
	{ code: "ka", name: "Georgian" },
	{ code: "de", name: "German", flag: "🇩🇪" },
	{ code: "el", name: "Greek" },
	{ code: "gu", name: "Gujarati" },
	{ code: "ht", name: "Haitian Creole" },
	{ code: "ha", name: "Hausa" },
	{ code: "haw", name: "Hawaiian" },
	{ code: "iw", name: "Hebrew" },
	{ code: "hi", name: "Hindi", flag: "🇮🇳" },
	{ code: "hmn", name: "Hmong" },
	{ code: "hu", name: "Hungarian" },
	{ code: "is", name: "Icelandic" },
	{ code: "ig", name: "Igbo" },
	{ code: "id", name: "Indonesian" },
	{ code: "ga", name: "Irish" },
	{ code: "it", name: "Italian", flag: "🇮🇹" },
	{ code: "ja", name: "Japanese", flag: "🇯🇵" },
	{ code: "jw", name: "Javanese" },
	{ code: "kn", name: "Kannada" },
	{ code: "kk", name: "Kazakh" },
	{ code: "km", name: "Khmer" },
	{ code: "rw", name: "Kinyarwanda" },
	{ code: "ko", name: "Korean", flag: "🇰🇷" },
	{ code: "ku", name: "Kurdish" },
	{ code: "ky", name: "Kyrgyz" },
	{ code: "lo", name: "Lao" },
	{ code: "la", name: "Latin" },
	{ code: "lv", name: "Latvian" },
	{ code: "lt", name: "Lithuanian" },
	{ code: "lb", name: "Luxembourgish" },
	{ code: "mk", name: "Macedonian" },
	{ code: "mg", name: "Malagasy" },
	{ code: "ms", name: "Malay" },
	{ code: "ml", name: "Malayalam" },
	{ code: "mt", name: "Maltese" },
	{ code: "mi", name: "Maori" },
	{ code: "mr", name: "Marathi" },
	{ code: "mn", name: "Mongolian" },
	{ code: "my", name: "Myanmar (Burmese)" },
	{ code: "ne", name: "Nepali" },
	{ code: "no", name: "Norwegian" },
	{ code: "or", name: "Odia" },
	{ code: "ps", name: "Pashto" },
	{ code: "fa", name: "Persian" },
	{ code: "pl", name: "Polish" },
	{ code: "pt", name: "Portuguese", flag: "🇵🇹" },
	{ code: "pa", name: "Punjabi" },
	{ code: "ro", name: "Romanian" },
	{ code: "ru", name: "Russian", flag: "🇷🇺" },
	{ code: "sm", name: "Samoan" },
	{ code: "gd", name: "Scots Gaelic" },
	{ code: "sr", name: "Serbian" },
	{ code: "st", name: "Sesotho" },
	{ code: "sn", name: "Shona" },
	{ code: "sd", name: "Sindhi" },
	{ code: "si", name: "Sinhala" },
	{ code: "sk", name: "Slovak" },
	{ code: "sl", name: "Slovenian" },
	{ code: "so", name: "Somali" },
	{ code: "es", name: "Spanish", flag: "🇪🇸" },
	{ code: "su", name: "Sundanese" },
	{ code: "sw", name: "Swahili" },
	{ code: "sv", name: "Swedish" },
	{ code: "tg", name: "Tajik" },
	{ code: "ta", name: "Tamil" },
	{ code: "tt", name: "Tatar" },
	{ code: "te", name: "Telugu" },
	{ code: "th", name: "Thai" },
	{ code: "tr", name: "Turkish", flag: "🇹🇷" },
	{ code: "tk", name: "Turkmen" },
	{ code: "uk", name: "Ukrainian" },
	{ code: "ur", name: "Urdu" },
	{ code: "ug", name: "Uyghur" },
	{ code: "uz", name: "Uzbek" },
	{ code: "vi", name: "Vietnamese" },
	{ code: "cy", name: "Welsh" },
	{ code: "xh", name: "Xhosa" },
	{ code: "yi", name: "Yiddish" },
	{ code: "yo", name: "Yoruba" },
	{ code: "zu", name: "Zulu" },
];

function getRootDomain(): string {
	const hostname = window.location.hostname;
	// For localhost or IP addresses, return as-is
	if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
		return hostname;
	}
	// Extract root domain (e.g., "www.stakex.finance" -> "stakex.finance")
	const parts = hostname.split(".");
	if (parts.length <= 2) return hostname;
	return parts.slice(-2).join(".");
}

function setCookie(lang: string) {
	const hostname = window.location.hostname;
	const rootDomain = getRootDomain();
	if (lang === "en") {
		// Clear cookies on all possible domain variations
		document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
		document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;
		document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`;
		document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
	} else {
		const value = `/en/${lang}`;
		document.cookie = `googtrans=${value}; path=/`;
		document.cookie = `googtrans=${value}; path=/; domain=${hostname}`;
		document.cookie = `googtrans=${value}; path=/; domain=.${rootDomain}`;
	}
}

function triggerGoogleTranslate(langCode: string) {
	const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
	if (combo) {
		combo.value = langCode;
		combo.dispatchEvent(new Event("change"));
		return true;
	}
	return false;
}

export default function LanguageSwitcher() {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [currentLang, setCurrentLang] = useState(() => {
		return localStorage.getItem("selectedLanguage") || "en";
	});
	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLInputElement>(null);

	const currentLangObj =
		LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES.find((l) => l.code === "en")!;

	const filtered = LANGUAGES.filter((l) =>
		l.name.toLowerCase().includes(search.toLowerCase())
	);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
				setSearch("");
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (isOpen && searchRef.current) {
			searchRef.current.focus();
		}
	}, [isOpen]);

	// On mount, if a language is saved, set the cookie and wait for Google Translate to be ready
	useEffect(() => {
		const saved = localStorage.getItem("selectedLanguage");
		if (saved && saved !== "en") {
			setCookie(saved);
			// Wait for Google Translate widget to initialize, then trigger
			const interval = setInterval(() => {
				const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
				if (combo) {
					clearInterval(interval);
					combo.value = saved;
					combo.dispatchEvent(new Event("change"));
				}
			}, 300);
			// Timeout: stop trying after 10 seconds
			const timeout = setTimeout(() => clearInterval(interval), 10000);
			return () => {
				clearInterval(interval);
				clearTimeout(timeout);
			};
		}
	}, []);

	function selectLanguage(code: string) {
		setCurrentLang(code);
		localStorage.setItem("selectedLanguage", code);
		setIsOpen(false);
		setSearch("");

		if (code === "en") {
			// Reset: clear cookies and reload
			setCookie("en");
			localStorage.setItem("selectedLanguage", "en");
			window.location.reload();
		} else {
			// Try combo first, fall back to cookie + reload
			const triggered = triggerGoogleTranslate(code);
			if (!triggered) {
				setCookie(code);
				window.location.reload();
			}
		}
	}

	return (
		<div ref={dropdownRef} className="relative notranslate">
			{/* Trigger Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
				aria-label="Change language"
				id="language-switcher-btn"
			>
				<Globe className="w-4 h-4 text-brand-400 group-hover:text-brand-300 transition-colors" />
				<span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
					{currentLangObj.code.split("-")[0]}
				</span>
				<ChevronDown
					className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div
					className="fixed top-20 left-1/2 -translate-x-1/2 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:translate-x-0 mt-3 w-72 max-h-96 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
					style={{ animation: "fadeSlideIn 0.2s ease-out" }}
				>
					{/* Search */}
					<div className="p-3 border-b border-white/10">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
							<input
								ref={searchRef}
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Search languages..."
								className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all"
							/>
						</div>
					</div>

					{/* Language List */}
					<div className="overflow-y-auto max-h-72 overscroll-contain">
						{filtered.length === 0 ? (
							<div className="p-6 text-center text-slate-500 text-sm">
								No languages found
							</div>
						) : (
							filtered.map((lang) => (
								<button
									key={lang.code}
									onClick={() => selectLanguage(lang.code)}
									className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer ${
										currentLang === lang.code
											? "bg-brand-500/10 text-brand-400"
											: "text-slate-300"
									}`}
								>
									<span className="text-lg w-6 flex justify-center items-center">
										{lang.flag || <Globe className="w-4 h-4 text-brand-400" />}
									</span>
									<span className="flex-1 text-sm font-medium">
										{lang.name}
									</span>
									{currentLang === lang.code && (
										<Check className="w-4 h-4 text-brand-400" />
									)}
								</button>
							))
						)}
					</div>

					{/* Footer */}
					<div className="h-1/10 py-2 border-t border-white/10 flex justify-center items-center bg-white/5">
						<p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center">
							Powered by Google Translate
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
