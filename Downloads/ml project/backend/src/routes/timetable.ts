import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/parse', authenticate, async (req: AuthRequest, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  const lines = text.split('\n');
  const subjects: Array<{ code: string, name: string, credits: number, type: string }> = [];

  // Very basic heuristic for VTOP timetable text
  // Looks for lines containing a typical course code pattern (e.g., BCSE101E, STS2001)
  const courseCodeRegex = /([A-Z]{3,4}\s?\d{3,4}[A-Z]?)/;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Ignore common VTOP headers and junk
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('date') && lowerLine.includes('time')) continue;
    if (lowerLine.includes('timetable') || lowerLine.includes('faculty')) continue;
    
    const match = line.match(courseCodeRegex);
    if (match) {
      const code = match[1];
      
      // Try to extract credits - look for standalone digits 1-4
      // Often looks like: BCSE101E Data Structures 4 Theory ...
      const words = line.replace(code, '').trim().split(/\s+/);
      
      let credits = 0;
      let nameParts = [];
      let type = 'Theory';

      for (let word of words) {
        if (/^[1-6]$/.test(word)) {
          credits = parseInt(word);
        } else if (word.toLowerCase() === 'eth' || word.toLowerCase() === 'th' || word.toLowerCase().includes('theory')) {
          type = 'Theory';
        } else if (word.toLowerCase() === 'ela' || word.toLowerCase() === 'la' || word.toLowerCase().includes('lab')) {
          type = 'Lab';
        } else if (word.toLowerCase() === 'epj' || word.toLowerCase() === 'pj' || word.toLowerCase().includes('project')) {
          type = 'Project';
        } else if (word.match(/^[A-Z0-9]+$/)) {
           // likely a section or slot, ignore
        } else {
           nameParts.push(word);
        }
      }

      // Fallback if name is empty
      let name = nameParts.join(' ');
      if (!name) name = 'Unknown Subject';

      subjects.push({
        code,
        name,
        credits: credits > 0 ? credits : 3, // fallback to 3 credits if unable to parse
        type
      });
    }
  }

  // Deduplicate by code
  const uniqueSubjects = [];
  const seenCodes = new Set();
  for (let sub of subjects) {
    if (!seenCodes.has(sub.code)) {
      seenCodes.add(sub.code);
      uniqueSubjects.push(sub);
    }
  }

  res.json({ subjects: uniqueSubjects });
});

export default router;
