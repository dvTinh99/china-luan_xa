# LinguaWorld — Learning Content and HSK Data Strategy

**Version:** 1.0

## 1. Curriculum decision

Use **HSK 3.0 as the primary new curriculum**, while optionally supporting HSK 2.0 as a separate curriculum for learners using older books or exam materials.

Do not merge HSK 2.0 and HSK 3.0 into a single level list. They are distinct curriculum versions with different structures and vocabulary coverage.

HSK 3.0 has nine levels grouped into three bands. The data model must be configurable and must not hardcode a six-level assumption.

## 2. Candidate sources

These are discovery starting points. Before importing or redistributing, inspect the current repository, source provenance, exact license and any upstream content restrictions.

### Official Chinese Test resource portal
- https://admin.chinesetest.cn/godownload.do
- Use as a reference for official syllabus, sample tests and associated learning/exam resources.
- Official availability does not automatically grant permission to redistribute all materials.

### HSK 3.0 vocabulary dataset
- https://github.com/uranbekanarbaev/hsk-3.0-vocabulary-dataset
- Candidate structured vocabulary source (CSV/JSON/PDF formats may be available).
- Verify the exact version, source attribution and LICENSE file before use.

### HSK 3.0 structured dataset
- https://github.com/profesorm/hsk30
- Candidate source for vocabulary and related language-learning structures.
- Verify repository license and upstream source attribution before commercial use.

### HSK Studio syllabus resource
- https://hsk-studio.com/vi/resources/syllabus
- Useful as a discovery/reference source for HSK 3.0 syllabus documents.
- Check document provenance and permissions before copying or redistributing.

## 3. Recommended content strategy

Use datasets for initial vocabulary structure, then enrich and review content.

| Content | Recommended source/process |
|---|---|
| Hanzi and HSK level | Syllabus/dataset, cross-checked |
| Pinyin | Dataset plus validation |
| Vietnamese meaning | Translate and human-review |
| Part of speech | Dataset plus editorial review |
| Example sentences | Original writing or licensed source |
| Audio | Licensed recording or generated TTS with appropriate rights |
| Grammar explanations | Original editorial content or licensed resources |
| Exercises | Generate from approved content and review |
| Stroke order | Licensed/open dataset with attribution |

Do not scrape commercial textbooks, paid apps or copyrighted audio without permission.

## 4. Data import pipeline

```text
Source files
   ↓
Raw import (immutable)
   ↓
Parser
   ↓
Normalization
   ↓
Schema validation
   ↓
Duplicate detection
   ↓
Vietnamese enrichment
   ↓
Editorial review
   ↓
Approved content
   ↓
Database publish
```

Keep raw source files and import logs for traceability. Every imported record should retain source and license metadata.

## 5. Suggested vocabulary model

A vocabulary item should not be represented by only one `word + meaning` pair.

Suggested logical fields:
- Hanzi (simplified/traditional where relevant).
- Pinyin.
- Vietnamese meaning(s).
- Part of speech.
- HSK curriculum/version and level membership.
- Topic/tags.
- Example sentences.
- Audio references.
- Notes.
- Source/provenance.
- Review status.

A word may appear in multiple curricula or levels. Model curriculum membership as a relation, not a single hardcoded level field on the vocabulary record.

## 6. Example content record

Illustrative only; verify level assignment against the selected syllabus before publishing:

```json
{
  "hanzi": "学习",
  "pinyin": "xuéxí",
  "meanings": [
    {
      "language": "vi",
      "text": "học; học tập"
    }
  ],
  "partOfSpeech": ["verb"],
  "examples": [
    {
      "hanzi": "我每天学习中文。",
      "pinyin": "Wǒ měitiān xuéxí Zhōngwén.",
      "translation": "Tôi học tiếng Trung mỗi ngày."
    }
  ],
  "audio": [],
  "curriculumMemberships": [],
  "source": {
    "name": "to be recorded",
    "url": "to be recorded",
    "license": "to be verified"
  },
  "reviewStatus": "draft"
}
```

## 7. MVP content target

Start with:
- One curriculum: HSK 3.0.
- Band 1 initial scope.
- First 100–300 vocabulary entries.
- Vietnamese meanings.
- Pinyin.
- Original example sentences.
- Audio for priority vocabulary.
- Three activity templates: flashcard, matching and quiz.

Do not import the entire HSK 3.0 corpus before the import/validation workflow is proven.

## 8. Content quality checklist

- [ ] Hanzi normalized.
- [ ] Pinyin validated.
- [ ] Meaning is natural Vietnamese.
- [ ] Part of speech reviewed.
- [ ] Curriculum version and level verified.
- [ ] Example sentence is grammatically correct.
- [ ] Translation reviewed.
- [ ] Audio pronunciation checked.
- [ ] Source and license recorded.
- [ ] No unlicensed textbook/exam content copied.
- [ ] Duplicate entries resolved.
- [ ] Content status approved before learner publication.
