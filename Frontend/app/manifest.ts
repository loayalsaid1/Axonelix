import { MetadataRoute } from "next";
import Logo from '@/public/images/logo.png';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Axonelix Medical Hub",
		short_name: "Axonelix",
		start_url: "/dashboard",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		icons: [
			{
				src: Logo.src,
				type: "image/png"
			}
		]
	};
}
