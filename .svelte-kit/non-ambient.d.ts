
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/auth" | "/auth/callback" | "/auth/verify" | "/login" | "/settings" | "/share-target" | "/topic" | "/topic/[id]";
		RouteParams(): {
			"/topic/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/auth/verify": Record<string, never>;
			"/login": Record<string, never>;
			"/settings": Record<string, never>;
			"/share-target": Record<string, never>;
			"/topic": { id?: string };
			"/topic/[id]": { id: string }
		};
		Pathname(): "/" | "/auth/callback" | "/auth/verify" | "/login" | "/settings" | "/share-target" | `/topic/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | "/icons/README.md" | string & {};
	}
}