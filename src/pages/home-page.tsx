import {
    Card,
    CardContent,
} from "@/components/ui/card.tsx";
import {TypographyH1} from "@/components/typography/headings.tsx";
import "../components/ui/theming/links.css"

function HomePage() {
    return (
        <div>
            <div className="flex flex-col items-center p-4 gap-6">
                <div className="w-full max-w-5xl">
                    <TypographyH1>FirmwareDroid</TypographyH1>
                </div>

                <Card className="w-full max-w-5xl">
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-2 theme-text-color">Welcome to FirmwareDroid</h3>
                        <p className="text-body">
                            This tool breaks down firmware images into their core components, extracts apps and
                            files, and highlights configuration issues that may expose devices to risk. You can use
                            FirmwareDroid to analyze Android-based firmware images from various IoT devices or for
                            scanning standalone Android APK files for security vulnerabilities.
                        </p>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-5xl">
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-2 theme-text-color">Getting started</h3>
                        <p className="text-body">
                            Get started by uploading a firmware image or an Android app via the
                            {' '}<a className="ui-link" href="./importer">Importer</a> operation. Once imported, you can start analyzing the
                            extracted Android apps using a set of security-focused tools available in the
                            {' '}<a className="ui-link" href="./firmware">Analysis</a> section.
                        </p>
                    </CardContent>
                </Card>

                <Card className="w-full max-w-5xl">
                    <CardContent>
                        <h3 className="text-lg font-semibold mb-2 theme-text-color">Exploring the API</h3>
                        <p className="text-body">
                            You can also explore the FirmwareDroid GraphQL API to access analysis results
                            programmatically, integrate findings into your own workflows, or build custom
                            tooling. The interactive API explorer is available at
                            {' '}<a className="ui-link" href="./graphql">./graphql</a>,
                            where you can browse available queries, inspect schemas, and test requests
                            directly in your browser.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default HomePage;
