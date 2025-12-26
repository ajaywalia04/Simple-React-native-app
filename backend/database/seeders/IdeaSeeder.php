<?php

namespace Database\Seeders;

use App\Models\Idea;
use App\Models\User;
use Illuminate\Database\Seeder;

class IdeaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user if doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'username' => 'testuser',
                'password' => bcrypt('password'),
            ]
        );

        // Technology category ideas (at least 4)
        $technologyIdeas = [
            'I think React Native is the future of mobile development. The ability to write once and deploy everywhere is game-changing.',
            'AI and machine learning will revolutionize how we build applications. We should start learning TensorFlow now.',
            'The new JavaScript frameworks are amazing! Next.js 14 with server components is incredible.',
            'Blockchain technology has potential beyond cryptocurrency. Smart contracts could transform legal systems.',
            'Cloud computing is becoming essential. AWS, Azure, and GCP are competing fiercely.',
            'I have an idea for a SaaS platform that helps freelancers manage their clients. Who wants to build it with me?',
            'Startup idea: A platform connecting local farmers directly with consumers. Fresh produce, no middleman!',
            'Thinking about starting a fintech startup focused on helping students manage their loans better.',
            'Idea for a startup: An app that matches co-founders based on skills and vision. Like Tinder but for entrepreneurs!',
            'What if we created a marketplace for side projects? People could buy and sell half-finished projects.',
            'The World Cup this year was incredible! The level of competition was unmatched.',
            'I think we should organize a local football tournament. Who\'s in?',
            'Basketball is the best sport for fitness. You get cardio and strength training in one game.',
            'Cricket needs more global recognition. It\'s such a strategic and exciting sport.',
            'Esports should be considered a real sport. The skill and dedication required is immense.',
            'I believe remote work is the future. Companies that don\'t adapt will lose top talent.',
            'Social media is both a blessing and a curse. We need better digital wellness tools.',
            'Education system needs a major overhaul. We\'re teaching kids outdated skills.',
            'Climate change is the most pressing issue of our generation. We need action now, not promises.',
            'The 4-day work week should become standard. Productivity doesn\'t decrease, happiness increases.',
            'Why do we park in driveways and drive on parkways? The English language is weird.',
            'If you could have dinner with any historical figure, who would it be? I\'d choose Leonardo da Vinci.',
            'What\'s your favorite conspiracy theory? Mine is that birds aren\'t real. Just kidding... or am I?',
            'I just realized that a group of flamingos is called a flamboyance. That\'s the best word ever!',
            'If animals could talk, which would be the rudest? I bet it\'s geese. They already have attitude.',
        ];


       

        // Create Technology ideas
        foreach ($technologyIdeas as $content) {
            Idea::create([
                'user_id' => $user->id,
                'content' => $content,
            ]);
        }

     

        
        $this->command->info('Technology: ' . count($technologyIdeas) . ' ideas');
       
    }
}
