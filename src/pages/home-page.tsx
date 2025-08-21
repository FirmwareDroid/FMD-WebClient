import {
    Card,
    CardContent,
} from "@/components/ui/card.tsx";

function HomePage() {
    return (
        <div className="flex justify-center p-4">
            <Card className="max-w-5xl">
                <CardContent>
                    <p className="text-center">
                        FirmwareDroid is a framework made for analysing Android firmware on scale. The initial framework was
                        developed at the Zurich University of Applied Sciences (ZHAW) by Thomas Sutter. You can find more
                        infos about the project on our <a href={"https://github.com/FirmwareDroid/FirmwareDroid"}>Github
                        repository.</a>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default HomePage;