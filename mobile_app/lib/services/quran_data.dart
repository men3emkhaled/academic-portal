import 'dart:math';

class Ayat {
  final String arabic;
  final String english;
  final String reference;

  Ayat({required this.arabic, required this.english, required this.reference});
}

class QuranData {
  static final List<Ayat> _ayats = [
    Ayat(
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الم',
      english: 'Alif, Lam, Meem.',
      reference: '[2:1]'
    ),
    Ayat(
      arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِلْمُتَّقِينَ',
      english: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah -',
      reference: '[2:2]'
    ),
    Ayat(
      arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنْفِقُونَ',
      english: 'Who believe in the unseen, establish prayer, and spend out of what We have provided for them,',
      reference: '[2:3]'
    ),
    Ayat(
      arabic: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنْزِلَ إِلَيْكَ وَمَا أُنْزِلَ مِنْ قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ',
      english: 'And who believe in what has been revealed to you, [O Muhammad], and what was revealed before you, and of the Hereafter they are certain [in faith].',
      reference: '[2:4]'
    ),
    Ayat(
      arabic: 'أُولَٰئِكَ عَلَىٰ هُدًى مِنْ رَبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ',
      english: 'Those are upon [right] guidance from their Lord, and it is those who are the successful.',
      reference: '[2:5]'
    ),
    Ayat(
      arabic: 'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنْذَرْتَهُمْ أَمْ لَمْ تُنْذِرْهُمْ لَا يُؤْمِنُونَ',
      english: 'Indeed, those who disbelieve - it is all the same for them whether you warn them or do not warn them - they will not believe.',
      reference: '[2:6]'
    ),
    Ayat(
      arabic: 'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ',
      english: 'Allah has set a seal upon their hearts and upon their hearing, and over their vision is a veil. And for them is a great punishment.',
      reference: '[2:7]'
    ),
    Ayat(
      arabic: 'وَمِنَ النَّاسِ مَنْ يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُمْ بِمُؤْمِنِينَ',
      english: 'And of the people are some who say, "We believe in Allah and the Last Day," but they are not believers.',
      reference: '[2:8]'
    ),
    Ayat(
      arabic: 'يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنْفُسَهُمْ وَمَا يَشْعُرُونَ',
      english: 'They [think to] deceive Allah and those who believe, but they deceive not except themselves and perceive [it] not.',
      reference: '[2:9]'
    ),
    Ayat(
      arabic: 'فِي قُلُوبِهِمْ مَرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ',
      english: 'In their hearts is disease, so Allah has increased their disease; and for them is a painful punishment because they [habitually] used to lie.',
      reference: '[2:10]'
    ),
    Ayat(
      arabic: 'وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ',
      english: 'And when it is said to them, "Do not cause corruption on the earth," they say, "We are but reformers."',
      reference: '[2:11]'
    ),
    Ayat(
      arabic: 'أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِنْ لَا يَشْعُرُونَ',
      english: 'Unquestionably, it is they who are the corrupters, but they perceive [it] not.',
      reference: '[2:12]'
    ),
    Ayat(
      arabic: 'وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ النَّاسُ قَالُوا أَنُؤْمِنُ كَمَا آمَنَ السُّفَهَاءُ ۗ أَلَا إِنَّهُمْ هُمُ السُّفَهَاءُ وَلَٰكِنْ لَا يَعْلَمُونَ',
      english: 'And when it is said to them, "Believe as the people have believed," they say, "Should we believe as the foolish have believed?" Unquestionably, it is they who are the foolish, but they know [it] not.',
      reference: '[2:13]'
    ),
    Ayat(
      arabic: 'وَإِذَا لَقُوا الَّذِينَ آمَنُوا قَالُوا آمَنَّا وَإِذَا خَلَوْا إِلَىٰ شَيَاطِينِهِمْ قَالُوا إِنَّا مَعَكُمْ إِنَّمَا نَحْنُ مُسْتَهْزِئُونَ',
      english: 'And when they meet those who believe, they say, "We believe"; but when they are alone with their evil ones, they say, "Indeed, we are with you; we were only mockers."',
      reference: '[2:14]'
    ),
    Ayat(
      arabic: 'اللَّهُ يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ فِي طُغْيَانِهِمْ يَعْمَهُونَ',
      english: '[But] Allah mocks them and prolongs them in their transgression [while] they wander blindly.',
      reference: '[2:15]'
    ),
    Ayat(
      arabic: 'أُولَٰئِكَ الَّذِينَ اشْتَرَوُا الضَّلَالَةَ بِالْهُدَىٰ فَمَا رَبِحَتْ تِجَارَتُهُمْ وَمَا كَانُوا مُهْتَدِينَ',
      english: 'Those are the ones who have purchased error [in exchange] for guidance, so their transaction has brought no profit, nor were they guided.',
      reference: '[2:16]'
    ),
    Ayat(
      arabic: 'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ مَا حَوْلَهُ ذَهَبَ اللَّهُ بِنُورِهِمْ وَتَرَكَهُمْ فِي ظُلُمَاتٍ لَا يُبْصِرُونَ',
      english: 'Their example is that of one who kindled a fire, but when it illuminated what was around him, Allah took away their light and left them in darkness [so] they could not see.',
      reference: '[2:17]'
    ),
    Ayat(
      arabic: 'صُمٌّ بُكْمٌ عُمْيٌ فَهُمْ لَا يَرْجِعُونَ',
      english: 'Deaf, dumb and blind - so they will not return [to the right path].',
      reference: '[2:18]'
    ),
    Ayat(
      arabic: 'أَوْ كَصَيِّبٍ مِنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ يَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِمْ مِنَ الصَّوَاعِقِ حَذَرَ الْمَوْتِ ۚ وَاللَّهُ مُحِيطٌ بِالْكَافِرِينَ',
      english: 'Or [it is] like a rainstorm from the sky within which is darkness, thunder and lightning. They put their fingers in their ears against the thunderclaps in dread of death. But Allah is encompassing of the disbelievers.',
      reference: '[2:19]'
    ),
    Ayat(
      arabic: 'يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا أَضَاءَ لَهُمْ مَشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ۚ وَلَوْ شَاءَ اللَّهُ لَذَهَبَ بِسَمْعِهِمْ وَأَبْصَارِهِمْ ۚ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      english: 'The lightning almost snatches away their sight. Every time it lights [the way] for them, they walk therein; but when darkness comes over them, they stand [still]. And if Allah had willed, He could have taken away their hearing and their sight. Indeed, Allah is over all things competent.',
      reference: '[2:20]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
      english: 'O mankind, worship your Lord, who created you and those before you, that you may become righteous -',
      reference: '[2:21]'
    ),
    Ayat(
      arabic: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً وَأَنْزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَكُمْ ۖ فَلَا تَجْعَلُوا لِلَّهِ أَنْدَادًا وَأَنْتُمْ تَعْلَمُونَ',
      english: '[He] who made for you the earth a bed [spread out] and the sky a ceiling and sent down from the sky, rain and brought forth thereby fruits as provision for you. So do not attribute to Allah equals while you know [that there is nothing similar to Him].',
      reference: '[2:22]'
    ),
    Ayat(
      arabic: 'وَإِنْ كُنْتُمْ فِي رَيْبٍ مِمَّا نَزَّلْنَا عَلَىٰ عَبْدِنَا فَأْتُوا بِسُورَةٍ مِنْ مِثْلِهِ وَادْعُوا شُهَدَاءَكُمْ مِنْ دُونِ اللَّهِ إِنْ كُنْتُمْ صَادِقِينَ',
      english: 'And if you are in doubt about what We have sent down upon Our Servant [Muhammad], then produce a surah the like thereof and call upon your witnesses other than Allah, if you should be truthful.',
      reference: '[2:23]'
    ),
    Ayat(
      arabic: 'فَإِنْ لَمْ تَفْعَلُوا وَلَنْ تَفْعَلُوا فَاتَّقُوا النَّارَ الَّتِي وَقُودُهَا النَّاسُ وَالْحِجَارَةُ ۖ أُعِدَّتْ لِلْكَافِرِينَ',
      english: 'But if you do not - and you will never be able to - then fear the Fire, whose fuel is men and stones, prepared for the disbelievers.',
      reference: '[2:24]'
    ),
    Ayat(
      arabic: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِنْ تَحْتِهَا الْأَنْهَارُ ۖ كُلَّمَا رُزِقُوا مِنْهَا مِنْ ثَمَرَةٍ رِزْقًا ۙ قَالُوا هَٰذَا الَّذِي رُزِقْنَا مِنْ قَبْلُ ۖ وَأُتُوا بِهِ مُتَشَابِهًا ۖ وَلَهُمْ فِيهَا أَزْوَاجٌ مُطَهَّرَةٌ ۖ وَهُمْ فِيهَا خَالِدُونَ',
      english: 'And give good tidings to those who believe and do righteous deeds that they will have gardens [in Paradise] beneath which rivers flow. Whenever they are provided with a provision of fruit therefrom, they will say, "This is what we were provided with before." And it is given to them in likeness. And they will have therein purified spouses, and they will abide therein eternally.',
      reference: '[2:25]'
    ),
    Ayat(
      arabic: '۞ إِنَّ اللَّهَ لَا يَسْتَحْيِي أَنْ يَضْرِبَ مَثَلًا مَا بَعُوضَةً فَمَا فَوْقَهَا ۚ فَأَمَّا الَّذِينَ آمَنُوا فَيَعْلَمُونَ أَنَّهُ الْحَقُّ مِنْ رَبِّهِمْ ۖ وَأَمَّا الَّذِينَ كَفَرُوا فَيَقُولُونَ مَاذَا أَرَادَ اللَّهُ بِهَٰذَا مَثَلًا ۘ يُضِلُّ بِهِ كَثِيرًا وَيَهْدِي بِهِ كَثِيرًا ۚ وَمَا يُضِلُّ بِهِ إِلَّا الْفَاسِقِينَ',
      english: 'Indeed, Allah is not timid to present an example - that of a mosquito or what is smaller than it. And those who have believed know that it is the truth from their Lord. But as for those who disbelieve, they say, "What did Allah intend by this as an example?" He misleads many thereby and guides many thereby. And He misleads not except the defiantly disobedient,',
      reference: '[2:26]'
    ),
    Ayat(
      arabic: 'الَّذِينَ يَنْقُضُونَ عَهْدَ اللَّهِ مِنْ بَعْدِ مِيثَاقِهِ وَيَقْطَعُونَ مَا أَمَرَ اللَّهُ بِهِ أَنْ يُوصَلَ وَيُفْسِدُونَ فِي الْأَرْضِ ۚ أُولَٰئِكَ هُمُ الْخَاسِرُونَ',
      english: 'Who break the covenant of Allah after contracting it and sever that which Allah has ordered to be joined and cause corruption on earth. It is those who are the losers.',
      reference: '[2:27]'
    ),
    Ayat(
      arabic: 'كَيْفَ تَكْفُرُونَ بِاللَّهِ وَكُنْتُمْ أَمْوَاتًا فَأَحْيَاكُمْ ۖ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ ثُمَّ إِلَيْهِ تُرْجَعُونَ',
      english: 'How can you disbelieve in Allah when you were lifeless and He brought you to life; then He will cause you to die, then He will bring you [back] to life, and then to Him you will be returned.',
      reference: '[2:28]'
    ),
    Ayat(
      arabic: 'هُوَ الَّذِي خَلَقَ لَكُمْ مَا فِي الْأَرْضِ جَمِيعًا ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ ۚ وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ',
      english: 'It is He who created for you all of that which is on the earth. Then He directed Himself to the heaven, [His being above all creation], and made them seven heavens, and He is Knowing of all things.',
      reference: '[2:29]'
    ),
    Ayat(
      arabic: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً ۖ قَالُوا أَتَجْعَلُ فِيهَا مَنْ يُفْسِدُ فِيهَا وَيَسْفِكُ الدِّمَاءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ لَكَ ۖ قَالَ إِنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ',
      english: 'And [mention, O Muhammad], when your Lord said to the angels, "Indeed, I will make upon the earth a successive authority." They said, "Will You place upon it one who causes corruption therein and sheds blood, while we declare Your praise and sanctify You?" Allah said, "Indeed, I know that which you do not know."',
      reference: '[2:30]'
    ),
    Ayat(
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ثُمَّ عَرَضَهُمْ عَلَى الْمَلَائِكَةِ فَقَالَ أَنْبِئُونِي بِأَسْمَاءِ هَٰؤُلَاءِ إِنْ كُنْتُمْ صَادِقِينَ',
      english: 'And He taught Adam the names - all of them. Then He showed them to the angels and said, "Inform Me of the names of these, if you are truthful."',
      reference: '[2:31]'
    ),
    Ayat(
      arabic: 'قَالُوا سُبْحَانَكَ لَا عِلْمَ لَنَا إِلَّا مَا عَلَّمْتَنَا ۖ إِنَّكَ أَنْتَ الْعَلِيمُ الْحَكِيمُ',
      english: 'They said, "Exalted are You; we have no knowledge except what You have taught us. Indeed, it is You who is the Knowing, the Wise."',
      reference: '[2:32]'
    ),
    Ayat(
      arabic: 'قَالَ يَا آدَمُ أَنْبِئْهُمْ بِأَسْمَائِهِمْ ۖ فَلَمَّا أَنْبَأَهُمْ بِأَسْمَائِهِمْ قَالَ أَلَمْ أَقُلْ لَكُمْ إِنِّي أَعْلَمُ غَيْبَ السَّمَاوَاتِ وَالْأَرْضِ وَأَعْلَمُ مَا تُبْدُونَ وَمَا كُنْتُمْ تَكْتُمُونَ',
      english: 'He said, "O Adam, inform them of their names." And when he had informed them of their names, He said, "Did I not tell you that I know the unseen [aspects] of the heavens and the earth? And I know what you reveal and what you have concealed."',
      reference: '[2:33]'
    ),
    Ayat(
      arabic: 'وَإِذْ قُلْنَا لِلْمَلَائِكَةِ اسْجُدُوا لِآدَمَ فَسَجَدُوا إِلَّا إِبْلِيسَ أَبَىٰ وَاسْتَكْبَرَ وَكَانَ مِنَ الْكَافِرِينَ',
      english: 'And [mention] when We said to the angels, "Prostrate before Adam"; so they prostrated, except for Iblees. He refused and was arrogant and became of the disbelievers.',
      reference: '[2:34]'
    ),
    Ayat(
      arabic: 'وَقُلْنَا يَا آدَمُ اسْكُنْ أَنْتَ وَزَوْجُكَ الْجَنَّةَ وَكُلَا مِنْهَا رَغَدًا حَيْثُ شِئْتُمَا وَلَا تَقْرَبَا هَٰذِهِ الشَّجَرَةَ فَتَكُونَا مِنَ الظَّالِمِينَ',
      english: 'And We said, "O Adam, dwell, you and your wife, in Paradise and eat therefrom in [ease and] abundance from wherever you will. But do not approach this tree, lest you be among the wrongdoers."',
      reference: '[2:35]'
    ),
    Ayat(
      arabic: 'فَأَزَلَّهُمَا الشَّيْطَانُ عَنْهَا فَأَخْرَجَهُمَا مِمَّا كَانَا فِيهِ ۖ وَقُلْنَا اهْبِطُوا بَعْضُكُمْ لِبَعْضٍ عَدُوٌّ ۖ وَلَكُمْ فِي الْأَرْضِ مُسْتَقَرٌّ وَمَتَاعٌ إِلَىٰ حِينٍ',
      english: 'But Satan caused them to slip out of it and removed them from that [condition] in which they had been. And We said, "Go down, [all of you], as enemies to one another, and you will have upon the earth a place of settlement and provision for a time."',
      reference: '[2:36]'
    ),
    Ayat(
      arabic: 'فَتَلَقَّىٰ آدَمُ مِنْ رَبِّهِ كَلِمَاتٍ فَتَابَ عَلَيْهِ ۚ إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ',
      english: 'Then Adam received from his Lord [some] words, and He accepted his repentance. Indeed, it is He who is the Accepting of repentance, the Merciful.',
      reference: '[2:37]'
    ),
    Ayat(
      arabic: 'قُلْنَا اهْبِطُوا مِنْهَا جَمِيعًا ۖ فَإِمَّا يَأْتِيَنَّكُمْ مِنِّي هُدًى فَمَنْ تَبِعَ هُدَايَ فَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
      english: 'We said, "Go down from it, all of you. And when guidance comes to you from Me, whoever follows My guidance - there will be no fear concerning them, nor will they grieve.',
      reference: '[2:38]'
    ),
    Ayat(
      arabic: 'وَالَّذِينَ كَفَرُوا وَكَذَّبُوا بِآيَاتِنَا أُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ',
      english: 'And those who disbelieve and deny Our signs - those will be companions of the Fire; they will abide therein eternally."',
      reference: '[2:39]'
    ),
    Ayat(
      arabic: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَوْفُوا بِعَهْدِي أُوفِ بِعَهْدِكُمْ وَإِيَّايَ فَارْهَبُونِ',
      english: 'O Children of Israel, remember My favor which I have bestowed upon you and fulfill My covenant [upon you] that I will fulfill your covenant [from Me], and be afraid of [only] Me.',
      reference: '[2:40]'
    ),
    Ayat(
      arabic: 'وَآمِنُوا بِمَا أَنْزَلْتُ مُصَدِّقًا لِمَا مَعَكُمْ وَلَا تَكُونُوا أَوَّلَ كَافِرٍ بِهِ ۖ وَلَا تَشْتَرُوا بِآيَاتِي ثَمَنًا قَلِيلًا وَإِيَّايَ فَاتَّقُونِ',
      english: 'And believe in what I have sent down confirming that which is [already] with you, and be not the first to disbelieve in it. And do not exchange My signs for a small price, and fear [only] Me.',
      reference: '[2:41]'
    ),
    Ayat(
      arabic: 'وَلَا تَلْبِسُوا الْحَقَّ بِالْبَاطِلِ وَتَكْتُمُوا الْحَقَّ وَأَنْتُمْ تَعْلَمُونَ',
      english: 'And do not mix the truth with falsehood or conceal the truth while you know [it].',
      reference: '[2:42]'
    ),
    Ayat(
      arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ',
      english: 'And establish prayer and give zakah and bow with those who bow [in worship and obedience].',
      reference: '[2:43]'
    ),
    Ayat(
      arabic: '۞ أَتَأْمُرُونَ النَّاسَ بِالْبِرِّ وَتَنْسَوْنَ أَنْفُسَكُمْ وَأَنْتُمْ تَتْلُونَ الْكِتَابَ ۚ أَفَلَا تَعْقِلُونَ',
      english: 'Do you order righteousness of the people and forget yourselves while you recite the Scripture? Then will you not reason?',
      reference: '[2:44]'
    ),
    Ayat(
      arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ',
      english: 'And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah]',
      reference: '[2:45]'
    ),
    Ayat(
      arabic: 'الَّذِينَ يَظُنُّونَ أَنَّهُمْ مُلَاقُو رَبِّهِمْ وَأَنَّهُمْ إِلَيْهِ رَاجِعُونَ',
      english: 'Who are certain that they will meet their Lord and that they will return to Him.',
      reference: '[2:46]'
    ),
    Ayat(
      arabic: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ',
      english: 'O Children of Israel, remember My favor that I have bestowed upon you and that I preferred you over the worlds.',
      reference: '[2:47]'
    ),
    Ayat(
      arabic: 'وَاتَّقُوا يَوْمًا لَا تَجْزِي نَفْسٌ عَنْ نَفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا شَفَاعَةٌ وَلَا يُؤْخَذُ مِنْهَا عَدْلٌ وَلَا هُمْ يُنْصَرُونَ',
      english: 'And fear a Day when no soul will suffice for another soul at all, nor will intercession be accepted from it, nor will compensation be taken from it, nor will they be aided.',
      reference: '[2:48]'
    ),
    Ayat(
      arabic: 'وَإِذْ نَجَّيْنَاكُمْ مِنْ آلِ فِرْعَوْنَ يَسُومُونَكُمْ سُوءَ الْعَذَابِ يُذَبِّحُونَ أَبْنَاءَكُمْ وَيَسْتَحْيُونَ نِسَاءَكُمْ ۚ وَفِي ذَٰلِكُمْ بَلَاءٌ مِنْ رَبِّكُمْ عَظِيمٌ',
      english: 'And [recall] when We saved your forefathers from the people of Pharaoh, who afflicted you with the worst torment, slaughtering your [newborn] sons and keeping your females alive. And in that was a great trial from your Lord.',
      reference: '[2:49]'
    ),
    Ayat(
      arabic: 'وَإِذْ فَرَقْنَا بِكُمُ الْبَحْرَ فَأَنْجَيْنَاكُمْ وَأَغْرَقْنَا آلَ فِرْعَوْنَ وَأَنْتُمْ تَنْظُرُونَ',
      english: 'And [recall] when We parted the sea for you and saved you and drowned the people of Pharaoh while you were looking on.',
      reference: '[2:50]'
    ),
    Ayat(
      arabic: 'وَإِذْ وَاعَدْنَا مُوسَىٰ أَرْبَعِينَ لَيْلَةً ثُمَّ اتَّخَذْتُمُ الْعِجْلَ مِنْ بَعْدِهِ وَأَنْتُمْ ظَالِمُونَ',
      english: 'And [recall] when We made an appointment with Moses for forty nights. Then you took [for worship] the calf after him, while you were wrongdoers.',
      reference: '[2:51]'
    ),
    Ayat(
      arabic: 'ثُمَّ عَفَوْنَا عَنْكُمْ مِنْ بَعْدِ ذَٰلِكَ لَعَلَّكُمْ تَشْكُرُونَ',
      english: 'Then We forgave you after that so perhaps you would be grateful.',
      reference: '[2:52]'
    ),
    Ayat(
      arabic: 'وَإِذْ آتَيْنَا مُوسَى الْكِتَابَ وَالْفُرْقَانَ لَعَلَّكُمْ تَهْتَدُونَ',
      english: 'And [recall] when We gave Moses the Scripture and criterion that perhaps you would be guided.',
      reference: '[2:53]'
    ),
    Ayat(
      arabic: 'وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ يَا قَوْمِ إِنَّكُمْ ظَلَمْتُمْ أَنْفُسَكُمْ بِاتِّخَاذِكُمُ الْعِجْلَ فَتُوبُوا إِلَىٰ بَارِئِكُمْ فَاقْتُلُوا أَنْفُسَكُمْ ذَٰلِكُمْ خَيْرٌ لَكُمْ عِنْدَ بَارِئِكُمْ فَتَابَ عَلَيْكُمْ ۚ إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ',
      english: 'And [recall] when Moses said to his people, "O my people, indeed you have wronged yourselves by your taking of the calf [for worship]. So repent to your Creator and kill yourselves. That is best for [all of] you in the sight of your Creator." Then He accepted your repentance; indeed, He is the Accepting of repentance, the Merciful.',
      reference: '[2:54]'
    ),
    Ayat(
      arabic: 'وَإِذْ قُلْتُمْ يَا مُوسَىٰ لَنْ نُؤْمِنَ لَكَ حَتَّىٰ نَرَى اللَّهَ جَهْرَةً فَأَخَذَتْكُمُ الصَّاعِقَةُ وَأَنْتُمْ تَنْظُرُونَ',
      english: 'And [recall] when you said, "O Moses, we will never believe you until we see Allah outright"; so the thunderbolt took you while you were looking on.',
      reference: '[2:55]'
    ),
    Ayat(
      arabic: 'ثُمَّ بَعَثْنَاكُمْ مِنْ بَعْدِ مَوْتِكُمْ لَعَلَّكُمْ تَشْكُرُونَ',
      english: 'Then We revived you after your death that perhaps you would be grateful.',
      reference: '[2:56]'
    ),
    Ayat(
      arabic: 'وَظَلَّلْنَا عَلَيْكُمُ الْغَمَامَ وَأَنْزَلْنَا عَلَيْكُمُ الْمَنَّ وَالسَّلْوَىٰ ۖ كُلُوا مِنْ طَيِّبَاتِ مَا رَزَقْنَاكُمْ ۖ وَمَا ظَلَمُونَا وَلَٰكِنْ كَانُوا أَنْفُسَهُمْ يَظْلِمُونَ',
      english: 'And We shaded you with clouds and sent down to you manna and quails, [saying], "Eat from the good things with which We have provided you." And they wronged Us not - but they were [only] wronging themselves.',
      reference: '[2:57]'
    ),
    Ayat(
      arabic: 'وَإِذْ قُلْنَا ادْخُلُوا هَٰذِهِ الْقَرْيَةَ فَكُلُوا مِنْهَا حَيْثُ شِئْتُمْ رَغَدًا وَادْخُلُوا الْبَابَ سُجَّدًا وَقُولُوا حِطَّةٌ نَغْفِرْ لَكُمْ خَطَايَاكُمْ ۚ وَسَنَزِيدُ الْمُحْسِنِينَ',
      english: 'And [recall] when We said, "Enter this city and eat from it wherever you will in [ease and] abundance, and enter the gate bowing humbly and say, \'Relieve us of our burdens.\' We will [then] forgive your sins for you, and We will increase the doers of good [in goodness and reward]."',
      reference: '[2:58]'
    ),
    Ayat(
      arabic: 'فَبَدَّلَ الَّذِينَ ظَلَمُوا قَوْلًا غَيْرَ الَّذِي قِيلَ لَهُمْ فَأَنْزَلْنَا عَلَى الَّذِينَ ظَلَمُوا رِجْزًا مِنَ السَّمَاءِ بِمَا كَانُوا يَفْسُقُونَ',
      english: 'But those who wronged changed [those words] to a statement other than that which had been said to them, so We sent down upon those who wronged a punishment from the sky because they were defiantly disobeying.',
      reference: '[2:59]'
    ),
    Ayat(
      arabic: '۞ وَإِذِ اسْتَسْقَىٰ مُوسَىٰ لِقَوْمِهِ فَقُلْنَا اضْرِبْ بِعَصَاكَ الْحَجَرَ ۖ فَانْفَجَرَتْ مِنْهُ اثْنَتَا عَشْرَةَ عَيْنًا ۖ قَدْ عَلِمَ كُلُّ أُنَاسٍ مَشْرَبَهُمْ ۖ كُلُوا وَاشْرَبُوا مِنْ رِزْقِ اللَّهِ وَلَا تَعْثَوْا فِي الْأَرْضِ مُفْسِدِينَ',
      english: 'And [recall] when Moses prayed for water for his people, so We said, "Strike with your staff the stone." And there gushed forth from it twelve springs, and every people knew its watering place. "Eat and drink from the provision of Allah, and do not commit abuse on the earth, spreading corruption."',
      reference: '[2:60]'
    ),
    Ayat(
      arabic: 'وَإِذْ قُلْتُمْ يَا مُوسَىٰ لَنْ نَصْبِرَ عَلَىٰ طَعَامٍ وَاحِدٍ فَادْعُ لَنَا رَبَّكَ يُخْرِجْ لَنَا مِمَّا تُنْبِتُ الْأَرْضُ مِنْ بَقْلِهَا وَقِثَّائِهَا وَفُومِهَا وَعَدَسِهَا وَبَصَلِهَا ۖ قَالَ أَتَسْتَبْدِلُونَ الَّذِي هُوَ أَدْنَىٰ بِالَّذِي هُوَ خَيْرٌ ۚ اهْبِطُوا مِصْرًا فَإِنَّ لَكُمْ مَا سَأَلْتُمْ ۗ وَضُرِبَتْ عَلَيْهِمُ الذِّلَّةُ وَالْمَسْكَنَةُ وَبَاءُوا بِغَضَبٍ مِنَ اللَّهِ ۗ ذَٰلِكَ بِأَنَّهُمْ كَانُوا يَكْفُرُونَ بِآيَاتِ اللَّهِ وَيَقْتُلُونَ النَّبِيِّينَ بِغَيْرِ الْحَقِّ ۗ ذَٰلِكَ بِمَا عَصَوْا وَكَانُوا يَعْتَدُونَ',
      english: 'And [recall] when you said, "O Moses, we can never endure one [kind of] food. So call upon your Lord to bring forth for us from the earth its green herbs and its cucumbers and its garlic and its lentils and its onions." [Moses] said, "Would you exchange what is better for what is less? Go into [any] settlement and indeed, you will have what you have asked." And they were covered with humiliation and poverty and returned with anger from Allah [upon them]. That was because they [repeatedly] disbelieved in the signs of Allah and killed the prophets without right. That was because they disobeyed and were [habitually] transgressing.',
      reference: '[2:61]'
    ),
    Ayat(
      arabic: 'إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَهُمْ أَجْرُهُمْ عِنْدَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
      english: 'Indeed, those who believed and those who were Jews or Christians or Sabeans [before Prophet Muhammad] - those [among them] who believed in Allah and the Last Day and did righteousness - will have their reward with their Lord, and no fear will there be concerning them, nor will they grieve.',
      reference: '[2:62]'
    ),
    Ayat(
      arabic: 'وَإِذْ أَخَذْنَا مِيثَاقَكُمْ وَرَفَعْنَا فَوْقَكُمُ الطُّورَ خُذُوا مَا آتَيْنَاكُمْ بِقُوَّةٍ وَاذْكُرُوا مَا فِيهِ لَعَلَّكُمْ تَتَّقُونَ',
      english: 'And [recall] when We took your covenant, [O Children of Israel, to abide by the Torah] and We raised over you the mount, [saying], "Take what We have given you with determination and remember what is in it that perhaps you may become righteous."',
      reference: '[2:63]'
    ),
    Ayat(
      arabic: 'ثُمَّ تَوَلَّيْتُمْ مِنْ بَعْدِ ذَٰلِكَ ۖ فَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ لَكُنْتُمْ مِنَ الْخَاسِرِينَ',
      english: 'Then you turned away after that. And if not for the favor of Allah upon you and His mercy, you would have been among the losers.',
      reference: '[2:64]'
    ),
    Ayat(
      arabic: 'وَلَقَدْ عَلِمْتُمُ الَّذِينَ اعْتَدَوْا مِنْكُمْ فِي السَّبْتِ فَقُلْنَا لَهُمْ كُونُوا قِرَدَةً خَاسِئِينَ',
      english: 'And you had already known about those who transgressed among you concerning the sabbath, and We said to them, "Be apes, despised."',
      reference: '[2:65]'
    ),
    Ayat(
      arabic: 'فَجَعَلْنَاهَا نَكَالًا لِمَا بَيْنَ يَدَيْهَا وَمَا خَلْفَهَا وَمَوْعِظَةً لِلْمُتَّقِينَ',
      english: 'And We made it a deterrent punishment for those who were present and those who succeeded [them] and a lesson for those who fear Allah.',
      reference: '[2:66]'
    ),
    Ayat(
      arabic: 'وَإِذْ قَالَ مُوسَىٰ لِقَوْمِهِ إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تَذْبَحُوا بَقَرَةً ۖ قَالُوا أَتَتَّخِذُنَا هُزُوًا ۖ قَالَ أَعُوذُ بِاللَّهِ أَنْ أَكُونَ مِنَ الْجَاهِلِينَ',
      english: 'And [recall] when Moses said to his people, "Indeed, Allah commands you to slaughter a cow." They said, "Do you take us in ridicule?" He said, "I seek refuge in Allah from being among the ignorant."',
      reference: '[2:67]'
    ),
    Ayat(
      arabic: 'قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّنْ لَنَا مَا هِيَ ۚ قَالَ إِنَّهُ يَقُولُ إِنَّهَا بَقَرَةٌ لَا فَارِضٌ وَلَا بِكْرٌ عَوَانٌ بَيْنَ ذَٰلِكَ ۖ فَافْعَلُوا مَا تُؤْمَرُونَ',
      english: 'They said, "Call upon your Lord to make clear to us what it is." [Moses] said, "[Allah] says, \'It is a cow which is neither old nor virgin, but median between that,\' so do what you are commanded."',
      reference: '[2:68]'
    ),
    Ayat(
      arabic: 'قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّنْ لَنَا مَا لَوْنُهَا ۚ قَالَ إِنَّهُ يَقُولُ إِنَّهَا بَقَرَةٌ صَفْرَاءُ فَاقِعٌ لَوْنُهَا تَسُرُّ النَّاظِرِينَ',
      english: 'They said, "Call upon your Lord to show us what is her color." He said, "He says, \'It is a yellow cow, bright in color - pleasing to the observers.\' "',
      reference: '[2:69]'
    ),
    Ayat(
      arabic: 'قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّنْ لَنَا مَا هِيَ إِنَّ الْبَقَرَ تَشَابَهَ عَلَيْنَا وَإِنَّا إِنْ شَاءَ اللَّهُ لَمُهْتَدُونَ',
      english: 'They said, "Call upon your Lord to make clear to us what it is. Indeed, [all] cows look alike to us. And indeed we, if Allah wills, will be guided."',
      reference: '[2:70]'
    ),
    Ayat(
      arabic: 'قَالَ إِنَّهُ يَقُولُ إِنَّهَا بَقَرَةٌ لَا ذَلُولٌ تُثِيرُ الْأَرْضَ وَلَا تَسْقِي الْحَرْثَ مُسَلَّمَةٌ لَا شِيَةَ فِيهَا ۚ قَالُوا الْآنَ جِئْتَ بِالْحَقِّ ۚ فَذَبَحُوهَا وَمَا كَادُوا يَفْعَلُونَ',
      english: 'He said, "He says, \'It is a cow neither trained to plow the earth nor to irrigate the field, one free from fault with no spot upon her.\' " They said, "Now you have come with the truth." So they slaughtered her, but they could hardly do it.',
      reference: '[2:71]'
    ),
    Ayat(
      arabic: 'وَإِذْ قَتَلْتُمْ نَفْسًا فَادَّارَأْتُمْ فِيهَا ۖ وَاللَّهُ مُخْرِجٌ مَا كُنْتُمْ تَكْتُمُونَ',
      english: 'And [recall] when you slew a man and disputed over it, but Allah was to bring out that which you were concealing.',
      reference: '[2:72]'
    ),
    Ayat(
      arabic: 'فَقُلْنَا اضْرِبُوهُ بِبَعْضِهَا ۚ كَذَٰلِكَ يُحْيِي اللَّهُ الْمَوْتَىٰ وَيُرِيكُمْ آيَاتِهِ لَعَلَّكُمْ تَعْقِلُونَ',
      english: 'So, We said, "Strike the slain man with part of it." Thus does Allah bring the dead to life, and He shows you His signs that you might reason.',
      reference: '[2:73]'
    ),
    Ayat(
      arabic: 'ثُمَّ قَسَتْ قُلُوبُكُمْ مِنْ بَعْدِ ذَٰلِكَ فَهِيَ كَالْحِجَارَةِ أَوْ أَشَدُّ قَسْوَةً ۚ وَإِنَّ مِنَ الْحِجَارَةِ لَمَا يَتَفَجَّرُ مِنْهُ الْأَنْهَارُ ۚ وَإِنَّ مِنْهَا لَمَا يَشَّقَّقُ فَيَخْرُجُ مِنْهُ الْمَاءُ ۚ وَإِنَّ مِنْهَا لَمَا يَهْبِطُ مِنْ خَشْيَةِ اللَّهِ ۗ وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ',
      english: 'Then your hearts became hardened after that, being like stones or even harder. For indeed, there are stones from which rivers burst forth, and there are some of them that split open and water comes out, and there are some of them that fall down for fear of Allah. And Allah is not unaware of what you do.',
      reference: '[2:74]'
    ),
    Ayat(
      arabic: '۞ أَفَتَطْمَعُونَ أَنْ يُؤْمِنُوا لَكُمْ وَقَدْ كَانَ فَرِيقٌ مِنْهُمْ يَسْمَعُونَ كَلَامَ اللَّهِ ثُمَّ يُحَرِّفُونَهُ مِنْ بَعْدِ مَا عَقَلُوهُ وَهُمْ يَعْلَمُونَ',
      english: 'Do you covet [the hope, O believers], that they would believe for you while a party of them used to hear the words of Allah and then distort the Torah after they had understood it while they were knowing?',
      reference: '[2:75]'
    ),
    Ayat(
      arabic: 'وَإِذَا لَقُوا الَّذِينَ آمَنُوا قَالُوا آمَنَّا وَإِذَا خَلَا بَعْضُهُمْ إِلَىٰ بَعْضٍ قَالُوا أَتُحَدِّثُونَهُمْ بِمَا فَتَحَ اللَّهُ عَلَيْكُمْ لِيُحَاجُّوكُمْ بِهِ عِنْدَ رَبِّكُمْ ۚ أَفَلَا تَعْقِلُونَ',
      english: 'And when they meet those who believe, they say, "We have believed"; but when they are alone with one another, they say, "Do you talk to them about what Allah has revealed to you so they can argue with you about it before your Lord?" Then will you not reason?',
      reference: '[2:76]'
    ),
    Ayat(
      arabic: 'أَوَلَا يَعْلَمُونَ أَنَّ اللَّهَ يَعْلَمُ مَا يُسِرُّونَ وَمَا يُعْلِنُونَ',
      english: 'But do they not know that Allah knows what they conceal and what they declare?',
      reference: '[2:77]'
    ),
    Ayat(
      arabic: 'وَمِنْهُمْ أُمِّيُّونَ لَا يَعْلَمُونَ الْكِتَابَ إِلَّا أَمَانِيَّ وَإِنْ هُمْ إِلَّا يَظُنُّونَ',
      english: 'And among them are unlettered ones who do not know the Scripture except in wishful thinking, but they are only assuming.',
      reference: '[2:78]'
    ),
    Ayat(
      arabic: 'فَوَيْلٌ لِلَّذِينَ يَكْتُبُونَ الْكِتَابَ بِأَيْدِيهِمْ ثُمَّ يَقُولُونَ هَٰذَا مِنْ عِنْدِ اللَّهِ لِيَشْتَرُوا بِهِ ثَمَنًا قَلِيلًا ۖ فَوَيْلٌ لَهُمْ مِمَّا كَتَبَتْ أَيْدِيهِمْ وَوَيْلٌ لَهُمْ مِمَّا يَكْسِبُونَ',
      english: 'So woe to those who write the "scripture" with their own hands, then say, "This is from Allah," in order to exchange it for a small price. Woe to them for what their hands have written and woe to them for what they earn.',
      reference: '[2:79]'
    ),
    Ayat(
      arabic: 'وَقَالُوا لَنْ تَمَسَّنَا النَّارُ إِلَّا أَيَّامًا مَعْدُودَةً ۚ قُلْ أَتَّخَذْتُمْ عِنْدَ اللَّهِ عَهْدًا فَلَنْ يُخْلِفَ اللَّهُ عَهْدَهُ ۖ أَمْ تَقُولُونَ عَلَى اللَّهِ مَا لَا تَعْلَمُونَ',
      english: 'And they say, "Never will the Fire touch us, except for a few days." Say, "Have you taken a covenant with Allah? For Allah will never break His covenant. Or do you say about Allah that which you do not know?"',
      reference: '[2:80]'
    ),
    Ayat(
      arabic: 'بَلَىٰ مَنْ كَسَبَ سَيِّئَةً وَأَحَاطَتْ بِهِ خَطِيئَتُهُ فَأُولَٰئِكَ أَصْحَابُ النَّارِ ۖ هُمْ فِيهَا خَالِدُونَ',
      english: 'Yes, whoever earns evil and his sin has encompassed him - those are the companions of the Fire; they will abide therein eternally.',
      reference: '[2:81]'
    ),
    Ayat(
      arabic: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أُولَٰئِكَ أَصْحَابُ الْجَنَّةِ ۖ هُمْ فِيهَا خَالِدُونَ',
      english: 'But they who believe and do righteous deeds - those are the companions of Paradise; they will abide therein eternally.',
      reference: '[2:82]'
    ),
    Ayat(
      arabic: 'وَإِذْ أَخَذْنَا مِيثَاقَ بَنِي إِسْرَائِيلَ لَا تَعْبُدُونَ إِلَّا اللَّهَ وَبِالْوَالِدَيْنِ إِحْسَانًا وَذِي الْقُرْبَىٰ وَالْيَتَامَىٰ وَالْمَسَاكِينِ وَقُولُوا لِلنَّاسِ حُسْنًا وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ثُمَّ تَوَلَّيْتُمْ إِلَّا قَلِيلًا مِنْكُمْ وَأَنْتُمْ مُعْرِضُونَ',
      english: 'And [recall] when We took the covenant from the Children of Israel, [enjoining upon them], "Do not worship except Allah; and to parents do good and to relatives, orphans, and the needy. And speak to people good [words] and establish prayer and give zakah." Then you turned away, except a few of you, and you were refusing.',
      reference: '[2:83]'
    ),
    Ayat(
      arabic: 'وَإِذْ أَخَذْنَا مِيثَاقَكُمْ لَا تَسْفِكُونَ دِمَاءَكُمْ وَلَا تُخْرِجُونَ أَنْفُسَكُمْ مِنْ دِيَارِكُمْ ثُمَّ أَقْرَرْتُمْ وَأَنْتُمْ تَشْهَدُونَ',
      english: 'And [recall] when We took your covenant, [saying], "Do not shed each other\'s blood or evict one another from your homes." Then you acknowledged [this] while you were witnessing.',
      reference: '[2:84]'
    ),
    Ayat(
      arabic: 'ثُمَّ أَنْتُمْ هَٰؤُلَاءِ تَقْتُلُونَ أَنْفُسَكُمْ وَتُخْرِجُونَ فَرِيقًا مِنْكُمْ مِنْ دِيَارِهِمْ تَظَاهَرُونَ عَلَيْهِمْ بِالْإِثْمِ وَالْعُدْوَانِ وَإِنْ يَأْتُوكُمْ أُسَارَىٰ تُفَادُوهُمْ وَهُوَ مُحَرَّمٌ عَلَيْكُمْ إِخْرَاجُهُمْ ۚ أَفَتُؤْمِنُونَ بِبَعْضِ الْكِتَابِ وَتَكْفُرُونَ بِبَعْضٍ ۚ فَمَا جَزَاءُ مَنْ يَفْعَلُ ذَٰلِكَ مِنْكُمْ إِلَّا خِزْيٌ فِي الْحَيَاةِ الدُّنْيَا ۖ وَيَوْمَ الْقِيَامَةِ يُرَدُّونَ إِلَىٰ أَشَدِّ الْعَذَابِ ۗ وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ',
      english: 'Then, you are those [same ones who are] killing one another and evicting a party of your people from their homes, cooperating against them in sin and aggression. And if they come to you as captives, you ransom them, although their eviction was forbidden to you. So do you believe in part of the Scripture and disbelieve in part? Then what is the recompense for those who do that among you except disgrace in worldly life; and on the Day of Resurrection they will be sent back to the severest of punishment. And Allah is not unaware of what you do.',
      reference: '[2:85]'
    ),
    Ayat(
      arabic: 'أُولَٰئِكَ الَّذِينَ اشْتَرَوُا الْحَيَاةَ الدُّنْيَا بِالْآخِرَةِ ۖ فَلَا يُخَفَّفُ عَنْهُمُ الْعَذَابُ وَلَا هُمْ يُنْصَرُونَ',
      english: 'Those are the ones who have bought the life of this world [in exchange] for the Hereafter, so the punishment will not be lightened for them, nor will they be aided.',
      reference: '[2:86]'
    ),
    Ayat(
      arabic: 'وَلَقَدْ آتَيْنَا مُوسَى الْكِتَابَ وَقَفَّيْنَا مِنْ بَعْدِهِ بِالرُّسُلِ ۖ وَآتَيْنَا عِيسَى ابْنَ مَرْيَمَ الْبَيِّنَاتِ وَأَيَّدْنَاهُ بِرُوحِ الْقُدُسِ ۗ أَفَكُلَّمَا جَاءَكُمْ رَسُولٌ بِمَا لَا تَهْوَىٰ أَنْفُسُكُمُ اسْتَكْبَرْتُمْ فَفَرِيقًا كَذَّبْتُمْ وَفَرِيقًا تَقْتُلُونَ',
      english: 'And We did certainly give Moses the Torah and followed up after him with messengers. And We gave Jesus, the son of Mary, clear proofs and supported him with the Pure Spirit. But is it [not] that every time a messenger came to you, [O Children of Israel], with what your souls did not desire, you were arrogant? And a party [of messengers] you denied and another party you killed.',
      reference: '[2:87]'
    ),
    Ayat(
      arabic: 'وَقَالُوا قُلُوبُنَا غُلْفٌ ۚ بَلْ لَعَنَهُمُ اللَّهُ بِكُفْرِهِمْ فَقَلِيلًا مَا يُؤْمِنُونَ',
      english: 'And they said, "Our hearts are wrapped." But, [in fact], Allah has cursed them for their disbelief, so little is it that they believe.',
      reference: '[2:88]'
    ),
    Ayat(
      arabic: 'وَلَمَّا جَاءَهُمْ كِتَابٌ مِنْ عِنْدِ اللَّهِ مُصَدِّقٌ لِمَا مَعَهُمْ وَكَانُوا مِنْ قَبْلُ يَسْتَفْتِحُونَ عَلَى الَّذِينَ كَفَرُوا فَلَمَّا جَاءَهُمْ مَا عَرَفُوا كَفَرُوا بِهِ ۚ فَلَعْنَةُ اللَّهِ عَلَى الْكَافِرِينَ',
      english: 'And when there came to them a Book from Allah confirming that which was with them - although before they used to pray for victory against those who disbelieved - but [then] when there came to them that which they recognized, they disbelieved in it; so the curse of Allah will be upon the disbelievers.',
      reference: '[2:89]'
    ),
    Ayat(
      arabic: 'بِئْسَمَا اشْتَرَوْا بِهِ أَنْفُسَهُمْ أَنْ يَكْفُرُوا بِمَا أَنْزَلَ اللَّهُ بَغْيًا أَنْ يُنَزِّلَ اللَّهُ مِنْ فَضْلِهِ عَلَىٰ مَنْ يَشَاءُ مِنْ عِبَادِهِ ۖ فَبَاءُوا بِغَضَبٍ عَلَىٰ غَضَبٍ ۚ وَلِلْكَافِرِينَ عَذَابٌ مُهِينٌ',
      english: 'How wretched is that for which they sold themselves - that they would disbelieve in what Allah has revealed through [their] outrage that Allah would send down His favor upon whom He wills from among His servants. So they returned having [earned] wrath upon wrath. And for the disbelievers is a humiliating punishment.',
      reference: '[2:90]'
    ),
    Ayat(
      arabic: 'وَإِذَا قِيلَ لَهُمْ آمِنُوا بِمَا أَنْزَلَ اللَّهُ قَالُوا نُؤْمِنُ بِمَا أُنْزِلَ عَلَيْنَا وَيَكْفُرُونَ بِمَا وَرَاءَهُ وَهُوَ الْحَقُّ مُصَدِّقًا لِمَا مَعَهُمْ ۗ قُلْ فَلِمَ تَقْتُلُونَ أَنْبِيَاءَ اللَّهِ مِنْ قَبْلُ إِنْ كُنْتُمْ مُؤْمِنِينَ',
      english: 'And when it is said to them, "Believe in what Allah has revealed," they say, "We believe [only] in what was revealed to us." And they disbelieve in what came after it, while it is the truth confirming that which is with them. Say, "Then why did you kill the prophets of Allah before, if you are [indeed] believers?"',
      reference: '[2:91]'
    ),
    Ayat(
      arabic: '۞ وَلَقَدْ جَاءَكُمْ مُوسَىٰ بِالْبَيِّنَاتِ ثُمَّ اتَّخَذْتُمُ الْعِجْلَ مِنْ بَعْدِهِ وَأَنْتُمْ ظَالِمُونَ',
      english: 'And Moses had certainly brought you clear proofs. Then you took the calf [in worship] after that, while you were wrongdoers.',
      reference: '[2:92]'
    ),
    Ayat(
      arabic: 'وَإِذْ أَخَذْنَا مِيثَاقَكُمْ وَرَفَعْنَا فَوْقَكُمُ الطُّورَ خُذُوا مَا آتَيْنَاكُمْ بِقُوَّةٍ وَاسْمَعُوا ۖ قَالُوا سَمِعْنَا وَعَصَيْنَا وَأُشْرِبُوا فِي قُلُوبِهِمُ الْعِجْلَ بِكُفْرِهِمْ ۚ قُلْ بِئْسَمَا يَأْمُرُكُمْ بِهِ إِيمَانُكُمْ إِنْ كُنْتُمْ مُؤْمِنِينَ',
      english: 'And [recall] when We took your covenant and raised over you the mount, [saying], "Take what We have given you with determination and listen." They said [instead], "We hear and disobey." And their hearts absorbed [the worship of] the calf because of their disbelief. Say, "How wretched is that which your faith enjoins upon you, if you should be believers."',
      reference: '[2:93]'
    ),
    Ayat(
      arabic: 'قُلْ إِنْ كَانَتْ لَكُمُ الدَّارُ الْآخِرَةُ عِنْدَ اللَّهِ خَالِصَةً مِنْ دُونِ النَّاسِ فَتَمَنَّوُا الْمَوْتَ إِنْ كُنْتُمْ صَادِقِينَ',
      english: 'Say, [O Muhammad], "If the home of the Hereafter with Allah is for you alone and not the [other] people, then wish for death, if you should be truthful.',
      reference: '[2:94]'
    ),
    Ayat(
      arabic: 'وَلَنْ يَتَمَنَّوْهُ أَبَدًا بِمَا قَدَّمَتْ أَيْدِيهِمْ ۗ وَاللَّهُ عَلِيمٌ بِالظَّالِمِينَ',
      english: 'But they will never wish for it, ever, because of what their hands have put forth. And Allah is Knowing of the wrongdoers.',
      reference: '[2:95]'
    ),
    Ayat(
      arabic: 'وَلَتَجِدَنَّهُمْ أَحْرَصَ النَّاسِ عَلَىٰ حَيَاةٍ وَمِنَ الَّذِينَ أَشْرَكُوا ۚ يَوَدُّ أَحَدُهُمْ لَوْ يُعَمَّرُ أَلْفَ سَنَةٍ وَمَا هُوَ بِمُزَحْزِحِهِ مِنَ الْعَذَابِ أَنْ يُعَمَّرَ ۗ وَاللَّهُ بَصِيرٌ بِمَا يَعْمَلُونَ',
      english: 'And you will surely find them the most greedy of people for life - [even] more than those who associate others with Allah. One of them wishes that he could be granted life a thousand years, but it would not remove him in the least from the [coming] punishment that he should be granted life. And Allah is Seeing of what they do.',
      reference: '[2:96]'
    ),
    Ayat(
      arabic: 'قُلْ مَنْ كَانَ عَدُوًّا لِجِبْرِيلَ فَإِنَّهُ نَزَّلَهُ عَلَىٰ قَلْبِكَ بِإِذْنِ اللَّهِ مُصَدِّقًا لِمَا بَيْنَ يَدَيْهِ وَهُدًى وَبُشْرَىٰ لِلْمُؤْمِنِينَ',
      english: 'Say, "Whoever is an enemy to Gabriel - it is [none but] he who has brought the Qur\'an down upon your heart, [O Muhammad], by permission of Allah, confirming that which was before it and as guidance and good tidings for the believers."',
      reference: '[2:97]'
    ),
    Ayat(
      arabic: 'مَنْ كَانَ عَدُوًّا لِلَّهِ وَمَلَائِكَتِهِ وَرُسُلِهِ وَجِبْرِيلَ وَمِيكَالَ فَإِنَّ اللَّهَ عَدُوٌّ لِلْكَافِرِينَ',
      english: 'Whoever is an enemy to Allah and His angels and His messengers and Gabriel and Michael - then indeed, Allah is an enemy to the disbelievers.',
      reference: '[2:98]'
    ),
    Ayat(
      arabic: 'وَلَقَدْ أَنْزَلْنَا إِلَيْكَ آيَاتٍ بَيِّنَاتٍ ۖ وَمَا يَكْفُرُ بِهَا إِلَّا الْفَاسِقُونَ',
      english: 'And We have certainly revealed to you verses [which are] clear proofs, and no one would deny them except the defiantly disobedient.',
      reference: '[2:99]'
    ),
    Ayat(
      arabic: 'أَوَكُلَّمَا عَاهَدُوا عَهْدًا نَبَذَهُ فَرِيقٌ مِنْهُمْ ۚ بَلْ أَكْثَرُهُمْ لَا يُؤْمِنُونَ',
      english: 'Is it not [true] that every time they took a covenant a party of them threw it away? But, [in fact], most of them do not believe.',
      reference: '[2:100]'
    ),
    Ayat(
      arabic: 'وَلَمَّا جَاءَهُمْ رَسُولٌ مِنْ عِنْدِ اللَّهِ مُصَدِّقٌ لِمَا مَعَهُمْ نَبَذَ فَرِيقٌ مِنَ الَّذِينَ أُوتُوا الْكِتَابَ كِتَابَ اللَّهِ وَرَاءَ ظُهُورِهِمْ كَأَنَّهُمْ لَا يَعْلَمُونَ',
      english: 'And when a messenger from Allah came to them confirming that which was with them, a party of those who had been given the Scripture threw the Scripture of Allah behind their backs as if they did not know [what it contained].',
      reference: '[2:101]'
    ),
    Ayat(
      arabic: 'وَاتَّبَعُوا مَا تَتْلُو الشَّيَاطِينُ عَلَىٰ مُلْكِ سُلَيْمَانَ ۖ وَمَا كَفَرَ سُلَيْمَانُ وَلَٰكِنَّ الشَّيَاطِينَ كَفَرُوا يُعَلِّمُونَ النَّاسَ السِّحْرَ وَمَا أُنْزِلَ عَلَى الْمَلَكَيْنِ بِبَابِلَ هَارُوتَ وَمَارُوتَ ۚ وَمَا يُعَلِّمَانِ مِنْ أَحَدٍ حَتَّىٰ يَقُولَا إِنَّمَا نَحْنُ فِتْنَةٌ فَلَا تَكْفُرْ ۖ فَيَتَعَلَّمُونَ مِنْهُمَا مَا يُفَرِّقُونَ بِهِ بَيْنَ الْمَرْءِ وَزَوْجِهِ ۚ وَمَا هُمْ بِضَارِّينَ بِهِ مِنْ أَحَدٍ إِلَّا بِإِذْنِ اللَّهِ ۚ وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ وَلَا يَنْفَعُهُمْ ۚ وَلَقَدْ عَلِمُوا لَمَنِ اشْتَرَاهُ مَا لَهُ فِي الْآخِرَةِ مِنْ خَلَاقٍ ۚ وَلَبِئْسَ مَا شَرَوْا بِهِ أَنْفُسَهُمْ ۚ لَوْ كَانُوا يَعْلَمُونَ',
      english: 'And they followed [instead] what the devils had recited during the reign of Solomon. It was not Solomon who disbelieved, but the devils disbelieved, teaching people magic and that which was revealed to the two angels at Babylon, Harut and Marut. But the two angels do not teach anyone unless they say, "We are a trial, so do not disbelieve [by practicing magic]." And [yet] they learn from them that by which they cause separation between a man and his wife. But they do not harm anyone through it except by permission of Allah. And the people learn what harms them and does not benefit them. But the Children of Israel certainly knew that whoever purchased the magic would not have in the Hereafter any share. And wretched is that for which they sold themselves, if they only knew.',
      reference: '[2:102]'
    ),
    Ayat(
      arabic: 'وَلَوْ أَنَّهُمْ آمَنُوا وَاتَّقَوْا لَمَثُوبَةٌ مِنْ عِنْدِ اللَّهِ خَيْرٌ ۖ لَوْ كَانُوا يَعْلَمُونَ',
      english: 'And if they had believed and feared Allah, then the reward from Allah would have been [far] better, if they only knew.',
      reference: '[2:103]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَقُولُوا رَاعِنَا وَقُولُوا انْظُرْنَا وَاسْمَعُوا ۗ وَلِلْكَافِرِينَ عَذَابٌ أَلِيمٌ',
      english: 'O you who have believed, say not [to Allah \'s Messenger], "Ra\'ina" but say, "Unthurna" and listen. And for the disbelievers is a painful punishment.',
      reference: '[2:104]'
    ),
    Ayat(
      arabic: 'مَا يَوَدُّ الَّذِينَ كَفَرُوا مِنْ أَهْلِ الْكِتَابِ وَلَا الْمُشْرِكِينَ أَنْ يُنَزَّلَ عَلَيْكُمْ مِنْ خَيْرٍ مِنْ رَبِّكُمْ ۗ وَاللَّهُ يَخْتَصُّ بِرَحْمَتِهِ مَنْ يَشَاءُ ۚ وَاللَّهُ ذُو الْفَضْلِ الْعَظِيمِ',
      english: 'Neither those who disbelieve from the People of the Scripture nor the polytheists wish that any good should be sent down to you from your Lord. But Allah selects for His mercy whom He wills, and Allah is the possessor of great bounty.',
      reference: '[2:105]'
    ),
    Ayat(
      arabic: '۞ مَا نَنْسَخْ مِنْ آيَةٍ أَوْ نُنْسِهَا نَأْتِ بِخَيْرٍ مِنْهَا أَوْ مِثْلِهَا ۗ أَلَمْ تَعْلَمْ أَنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      english: 'We do not abrogate a verse or cause it to be forgotten except that We bring forth [one] better than it or similar to it. Do you not know that Allah is over all things competent?',
      reference: '[2:106]'
    ),
    Ayat(
      arabic: 'أَلَمْ تَعْلَمْ أَنَّ اللَّهَ لَهُ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ ۗ وَمَا لَكُمْ مِنْ دُونِ اللَّهِ مِنْ وَلِيٍّ وَلَا نَصِيرٍ',
      english: 'Do you not know that to Allah belongs the dominion of the heavens and the earth and [that] you have not besides Allah any protector or any helper?',
      reference: '[2:107]'
    ),
    Ayat(
      arabic: 'أَمْ تُرِيدُونَ أَنْ تَسْأَلُوا رَسُولَكُمْ كَمَا سُئِلَ مُوسَىٰ مِنْ قَبْلُ ۗ وَمَنْ يَتَبَدَّلِ الْكُفْرَ بِالْإِيمَانِ فَقَدْ ضَلَّ سَوَاءَ السَّبِيلِ',
      english: 'Or do you intend to ask your Messenger as Moses was asked before? And whoever exchanges faith for disbelief has certainly strayed from the soundness of the way.',
      reference: '[2:108]'
    ),
    Ayat(
      arabic: 'وَدَّ كَثِيرٌ مِنْ أَهْلِ الْكِتَابِ لَوْ يَرُدُّونَكُمْ مِنْ بَعْدِ إِيمَانِكُمْ كُفَّارًا حَسَدًا مِنْ عِنْدِ أَنْفُسِهِمْ مِنْ بَعْدِ مَا تَبَيَّنَ لَهُمُ الْحَقُّ ۖ فَاعْفُوا وَاصْفَحُوا حَتَّىٰ يَأْتِيَ اللَّهُ بِأَمْرِهِ ۗ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      english: 'Many of the People of the Scripture wish they could turn you back to disbelief after you have believed, out of envy from themselves [even] after the truth has become clear to them. So pardon and overlook until Allah delivers His command. Indeed, Allah is over all things competent.',
      reference: '[2:109]'
    ),
    Ayat(
      arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ۚ وَمَا تُقَدِّمُوا لِأَنْفُسِكُمْ مِنْ خَيْرٍ تَجِدُوهُ عِنْدَ اللَّهِ ۗ إِنَّ اللَّهَ بِمَا تَعْمَلُونَ بَصِيرٌ',
      english: 'And establish prayer and give zakah, and whatever good you put forward for yourselves - you will find it with Allah. Indeed, Allah of what you do, is Seeing.',
      reference: '[2:110]'
    ),
    Ayat(
      arabic: 'وَقَالُوا لَنْ يَدْخُلَ الْجَنَّةَ إِلَّا مَنْ كَانَ هُودًا أَوْ نَصَارَىٰ ۗ تِلْكَ أَمَانِيُّهُمْ ۗ قُلْ هَاتُوا بُرْهَانَكُمْ إِنْ كُنْتُمْ صَادِقِينَ',
      english: 'And they say, "None will enter Paradise except one who is a Jew or a Christian." That is [merely] their wishful thinking, Say, "Produce your proof, if you should be truthful."',
      reference: '[2:111]'
    ),
    Ayat(
      arabic: 'بَلَىٰ مَنْ أَسْلَمَ وَجْهَهُ لِلَّهِ وَهُوَ مُحْسِنٌ فَلَهُ أَجْرُهُ عِنْدَ رَبِّهِ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
      english: 'Yes [on the contrary], whoever submits his face in Islam to Allah while being a doer of good will have his reward with his Lord. And no fear will there be concerning them, nor will they grieve.',
      reference: '[2:112]'
    ),
    Ayat(
      arabic: 'وَقَالَتِ الْيَهُودُ لَيْسَتِ النَّصَارَىٰ عَلَىٰ شَيْءٍ وَقَالَتِ النَّصَارَىٰ لَيْسَتِ الْيَهُودُ عَلَىٰ شَيْءٍ وَهُمْ يَتْلُونَ الْكِتَابَ ۗ كَذَٰلِكَ قَالَ الَّذِينَ لَا يَعْلَمُونَ مِثْلَ قَوْلِهِمْ ۚ فَاللَّهُ يَحْكُمُ بَيْنَهُمْ يَوْمَ الْقِيَامَةِ فِيمَا كَانُوا فِيهِ يَخْتَلِفُونَ',
      english: 'The Jews say "The Christians have nothing [true] to stand on," and the Christians say, "The Jews have nothing to stand on," although they [both] recite the Scripture. Thus the polytheists speak the same as their words. But Allah will judge between them on the Day of Resurrection concerning that over which they used to differ.',
      reference: '[2:113]'
    ),
    Ayat(
      arabic: 'وَمَنْ أَظْلَمُ مِمَّنْ مَنَعَ مَسَاجِدَ اللَّهِ أَنْ يُذْكَرَ فِيهَا اسْمُهُ وَسَعَىٰ فِي خَرَابِهَا ۚ أُولَٰئِكَ مَا كَانَ لَهُمْ أَنْ يَدْخُلُوهَا إِلَّا خَائِفِينَ ۚ لَهُمْ فِي الدُّنْيَا خِزْيٌ وَلَهُمْ فِي الْآخِرَةِ عَذَابٌ عَظِيمٌ',
      english: 'And who are more unjust than those who prevent the name of Allah from being mentioned in His mosques and strive toward their destruction. It is not for them to enter them except in fear. For them in this world is disgrace, and they will have in the Hereafter a great punishment.',
      reference: '[2:114]'
    ),
    Ayat(
      arabic: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ ۚ إِنَّ اللَّهَ وَاسِعٌ عَلِيمٌ',
      english: 'And to Allah belongs the east and the west. So wherever you [might] turn, there is the Face of Allah. Indeed, Allah is all-Encompassing and Knowing.',
      reference: '[2:115]'
    ),
    Ayat(
      arabic: 'وَقَالُوا اتَّخَذَ اللَّهُ وَلَدًا ۗ سُبْحَانَهُ ۖ بَلْ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ ۖ كُلٌّ لَهُ قَانِتُونَ',
      english: 'They say, "Allah has taken a son." Exalted is He! Rather, to Him belongs whatever is in the heavens and the earth. All are devoutly obedient to Him,',
      reference: '[2:116]'
    ),
    Ayat(
      arabic: 'بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ ۖ وَإِذَا قَضَىٰ أَمْرًا فَإِنَّمَا يَقُولُ لَهُ كُنْ فَيَكُونُ',
      english: 'Originator of the heavens and the earth. When He decrees a matter, He only says to it, "Be," and it is.',
      reference: '[2:117]'
    ),
    Ayat(
      arabic: 'وَقَالَ الَّذِينَ لَا يَعْلَمُونَ لَوْلَا يُكَلِّمُنَا اللَّهُ أَوْ تَأْتِينَا آيَةٌ ۗ كَذَٰلِكَ قَالَ الَّذِينَ مِنْ قَبْلِهِمْ مِثْلَ قَوْلِهِمْ ۘ تَشَابَهَتْ قُلُوبُهُمْ ۗ قَدْ بَيَّنَّا الْآيَاتِ لِقَوْمٍ يُوقِنُونَ',
      english: 'Those who do not know say, "Why does Allah not speak to us or there come to us a sign?" Thus spoke those before them like their words. Their hearts resemble each other. We have shown clearly the signs to a people who are certain [in faith].',
      reference: '[2:118]'
    ),
    Ayat(
      arabic: 'إِنَّا أَرْسَلْنَاكَ بِالْحَقِّ بَشِيرًا وَنَذِيرًا ۖ وَلَا تُسْأَلُ عَنْ أَصْحَابِ الْجَحِيمِ',
      english: 'Indeed, We have sent you, [O Muhammad], with the truth as a bringer of good tidings and a warner, and you will not be asked about the companions of Hellfire.',
      reference: '[2:119]'
    ),
    Ayat(
      arabic: 'وَلَنْ تَرْضَىٰ عَنْكَ الْيَهُودُ وَلَا النَّصَارَىٰ حَتَّىٰ تَتَّبِعَ مِلَّتَهُمْ ۗ قُلْ إِنَّ هُدَى اللَّهِ هُوَ الْهُدَىٰ ۗ وَلَئِنِ اتَّبَعْتَ أَهْوَاءَهُمْ بَعْدَ الَّذِي جَاءَكَ مِنَ الْعِلْمِ ۙ مَا لَكَ مِنَ اللَّهِ مِنْ وَلِيٍّ وَلَا نَصِيرٍ',
      english: 'And never will the Jews or the Christians approve of you until you follow their religion. Say, "Indeed, the guidance of Allah is the [only] guidance." If you were to follow their desires after what has come to you of knowledge, you would have against Allah no protector or helper.',
      reference: '[2:120]'
    ),
    Ayat(
      arabic: 'الَّذِينَ آتَيْنَاهُمُ الْكِتَابَ يَتْلُونَهُ حَقَّ تِلَاوَتِهِ أُولَٰئِكَ يُؤْمِنُونَ بِهِ ۗ وَمَنْ يَكْفُرْ بِهِ فَأُولَٰئِكَ هُمُ الْخَاسِرُونَ',
      english: 'Those to whom We have given the Book recite it with its true recital. They [are the ones who] believe in it. And whoever disbelieves in it - it is they who are the losers.',
      reference: '[2:121]'
    ),
    Ayat(
      arabic: 'يَا بَنِي إِسْرَائِيلَ اذْكُرُوا نِعْمَتِيَ الَّتِي أَنْعَمْتُ عَلَيْكُمْ وَأَنِّي فَضَّلْتُكُمْ عَلَى الْعَالَمِينَ',
      english: 'O Children of Israel, remember My favor which I have bestowed upon you and that I preferred you over the worlds.',
      reference: '[2:122]'
    ),
    Ayat(
      arabic: 'وَاتَّقُوا يَوْمًا لَا تَجْزِي نَفْسٌ عَنْ نَفْسٍ شَيْئًا وَلَا يُقْبَلُ مِنْهَا عَدْلٌ وَلَا تَنْفَعُهَا شَفَاعَةٌ وَلَا هُمْ يُنْصَرُونَ',
      english: 'And fear a Day when no soul will suffice for another soul at all, and no compensation will be accepted from it, nor will any intercession benefit it, nor will they be aided.',
      reference: '[2:123]'
    ),
    Ayat(
      arabic: '۞ وَإِذِ ابْتَلَىٰ إِبْرَاهِيمَ رَبُّهُ بِكَلِمَاتٍ فَأَتَمَّهُنَّ ۖ قَالَ إِنِّي جَاعِلُكَ لِلنَّاسِ إِمَامًا ۖ قَالَ وَمِنْ ذُرِّيَّتِي ۖ قَالَ لَا يَنَالُ عَهْدِي الظَّالِمِينَ',
      english: 'And [mention, O Muhammad], when Abraham was tried by his Lord with commands and he fulfilled them. [Allah] said, "Indeed, I will make you a leader for the people." [Abraham] said, "And of my descendants?" [Allah] said, "My covenant does not include the wrongdoers."',
      reference: '[2:124]'
    ),
    Ayat(
      arabic: 'وَإِذْ جَعَلْنَا الْبَيْتَ مَثَابَةً لِلنَّاسِ وَأَمْنًا وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى ۖ وَعَهِدْنَا إِلَىٰ إِبْرَاهِيمَ وَإِسْمَاعِيلَ أَنْ طَهِّرَا بَيْتِيَ لِلطَّائِفِينَ وَالْعَاكِفِينَ وَالرُّكَّعِ السُّجُودِ',
      english: 'And [mention] when We made the House a place of return for the people and [a place of] security. And take, [O believers], from the standing place of Abraham a place of prayer. And We charged Abraham and Ishmael, [saying], "Purify My House for those who perform Tawaf and those who are staying [there] for worship and those who bow and prostrate [in prayer]."',
      reference: '[2:125]'
    ),
    Ayat(
      arabic: 'وَإِذْ قَالَ إِبْرَاهِيمُ رَبِّ اجْعَلْ هَٰذَا بَلَدًا آمِنًا وَارْزُقْ أَهْلَهُ مِنَ الثَّمَرَاتِ مَنْ آمَنَ مِنْهُمْ بِاللَّهِ وَالْيَوْمِ الْآخِرِ ۖ قَالَ وَمَنْ كَفَرَ فَأُمَتِّعُهُ قَلِيلًا ثُمَّ أَضْطَرُّهُ إِلَىٰ عَذَابِ النَّارِ ۖ وَبِئْسَ الْمَصِيرُ',
      english: 'And [mention] when Abraham said, "My Lord, make this a secure city and provide its people with fruits - whoever of them believes in Allah and the Last Day." [Allah] said. "And whoever disbelieves - I will grant him enjoyment for a little; then I will force him to the punishment of the Fire, and wretched is the destination."',
      reference: '[2:126]'
    ),
    Ayat(
      arabic: 'وَإِذْ يَرْفَعُ إِبْرَاهِيمُ الْقَوَاعِدَ مِنَ الْبَيْتِ وَإِسْمَاعِيلُ رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ',
      english: 'And [mention] when Abraham was raising the foundations of the House and [with him] Ishmael, [saying], "Our Lord, accept [this] from us. Indeed You are the Hearing, the Knowing.',
      reference: '[2:127]'
    ),
    Ayat(
      arabic: 'رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِنْ ذُرِّيَّتِنَا أُمَّةً مُسْلِمَةً لَكَ وَأَرِنَا مَنَاسِكَنَا وَتُبْ عَلَيْنَا ۖ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
      english: 'Our Lord, and make us Muslims [in submission] to You and from our descendants a Muslim nation [in submission] to You. And show us our rites and accept our repentance. Indeed, You are the Accepting of repentance, the Merciful.',
      reference: '[2:128]'
    ),
    Ayat(
      arabic: 'رَبَّنَا وَابْعَثْ فِيهِمْ رَسُولًا مِنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِكَ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَيُزَكِّيهِمْ ۚ إِنَّكَ أَنْتَ الْعَزِيزُ الْحَكِيمُ',
      english: 'Our Lord, and send among them a messenger from themselves who will recite to them Your verses and teach them the Book and wisdom and purify them. Indeed, You are the Exalted in Might, the Wise."',
      reference: '[2:129]'
    ),
    Ayat(
      arabic: 'وَمَنْ يَرْغَبُ عَنْ مِلَّةِ إِبْرَاهِيمَ إِلَّا مَنْ سَفِهَ نَفْسَهُ ۚ وَلَقَدِ اصْطَفَيْنَاهُ فِي الدُّنْيَا ۖ وَإِنَّهُ فِي الْآخِرَةِ لَمِنَ الصَّالِحِينَ',
      english: 'And who would be averse to the religion of Abraham except one who makes a fool of himself. And We had chosen him in this world, and indeed he, in the Hereafter, will be among the righteous.',
      reference: '[2:130]'
    ),
    Ayat(
      arabic: 'إِذْ قَالَ لَهُ رَبُّهُ أَسْلِمْ ۖ قَالَ أَسْلَمْتُ لِرَبِّ الْعَالَمِينَ',
      english: 'When his Lord said to him, "Submit", he said "I have submitted [in Islam] to the Lord of the worlds."',
      reference: '[2:131]'
    ),
    Ayat(
      arabic: 'وَوَصَّىٰ بِهَا إِبْرَاهِيمُ بَنِيهِ وَيَعْقُوبُ يَا بَنِيَّ إِنَّ اللَّهَ اصْطَفَىٰ لَكُمُ الدِّينَ فَلَا تَمُوتُنَّ إِلَّا وَأَنْتُمْ مُسْلِمُونَ',
      english: 'And Abraham instructed his sons [to do the same] and [so did] Jacob, [saying], "O my sons, indeed Allah has chosen for you this religion, so do not die except while you are Muslims."',
      reference: '[2:132]'
    ),
    Ayat(
      arabic: 'أَمْ كُنْتُمْ شُهَدَاءَ إِذْ حَضَرَ يَعْقُوبَ الْمَوْتُ إِذْ قَالَ لِبَنِيهِ مَا تَعْبُدُونَ مِنْ بَعْدِي قَالُوا نَعْبُدُ إِلَٰهَكَ وَإِلَٰهَ آبَائِكَ إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ إِلَٰهًا وَاحِدًا وَنَحْنُ لَهُ مُسْلِمُونَ',
      english: 'Or were you witnesses when death approached Jacob, when he said to his sons, "What will you worship after me?" They said, "We will worship your God and the God of your fathers, Abraham and Ishmael and Isaac - one God. And we are Muslims [in submission] to Him."',
      reference: '[2:133]'
    ),
    Ayat(
      arabic: 'تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُمْ مَا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ',
      english: 'That was a nation which has passed on. It will have [the consequence of] what it earned, and you will have what you have earned. And you will not be asked about what they used to do.',
      reference: '[2:134]'
    ),
    Ayat(
      arabic: 'وَقَالُوا كُونُوا هُودًا أَوْ نَصَارَىٰ تَهْتَدُوا ۗ قُلْ بَلْ مِلَّةَ إِبْرَاهِيمَ حَنِيفًا ۖ وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
      english: 'They say, "Be Jews or Christians [so] you will be guided." Say, "Rather, [we follow] the religion of Abraham, inclining toward truth, and he was not of the polytheists."',
      reference: '[2:135]'
    ),
    Ayat(
      arabic: 'قُولُوا آمَنَّا بِاللَّهِ وَمَا أُنْزِلَ إِلَيْنَا وَمَا أُنْزِلَ إِلَىٰ إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ وَيَعْقُوبَ وَالْأَسْبَاطِ وَمَا أُوتِيَ مُوسَىٰ وَعِيسَىٰ وَمَا أُوتِيَ النَّبِيُّونَ مِنْ رَبِّهِمْ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْهُمْ وَنَحْنُ لَهُ مُسْلِمُونَ',
      english: 'Say, [O believers], "We have believed in Allah and what has been revealed to us and what has been revealed to Abraham and Ishmael and Isaac and Jacob and the Descendants and what was given to Moses and Jesus and what was given to the prophets from their Lord. We make no distinction between any of them, and we are Muslims [in submission] to Him."',
      reference: '[2:136]'
    ),
    Ayat(
      arabic: 'فَإِنْ آمَنُوا بِمِثْلِ مَا آمَنْتُمْ بِهِ فَقَدِ اهْتَدَوْا ۖ وَإِنْ تَوَلَّوْا فَإِنَّمَا هُمْ فِي شِقَاقٍ ۖ فَسَيَكْفِيكَهُمُ اللَّهُ ۚ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      english: 'So if they believe in the same as you believe in, then they have been [rightly] guided; but if they turn away, they are only in dissension, and Allah will be sufficient for you against them. And He is the Hearing, the Knowing.',
      reference: '[2:137]'
    ),
    Ayat(
      arabic: 'صِبْغَةَ اللَّهِ ۖ وَمَنْ أَحْسَنُ مِنَ اللَّهِ صِبْغَةً ۖ وَنَحْنُ لَهُ عَابِدُونَ',
      english: '[And say, "Ours is] the religion of Allah. And who is better than Allah in [ordaining] religion? And we are worshippers of Him."',
      reference: '[2:138]'
    ),
    Ayat(
      arabic: 'قُلْ أَتُحَاجُّونَنَا فِي اللَّهِ وَهُوَ رَبُّنَا وَرَبُّكُمْ وَلَنَا أَعْمَالُنَا وَلَكُمْ أَعْمَالُكُمْ وَنَحْنُ لَهُ مُخْلِصُونَ',
      english: 'Say, [O Muhammad], "Do you argue with us about Allah while He is our Lord and your Lord? For us are our deeds, and for you are your deeds. And we are sincere [in deed and intention] to Him."',
      reference: '[2:139]'
    ),
    Ayat(
      arabic: 'أَمْ تَقُولُونَ إِنَّ إِبْرَاهِيمَ وَإِسْمَاعِيلَ وَإِسْحَاقَ وَيَعْقُوبَ وَالْأَسْبَاطَ كَانُوا هُودًا أَوْ نَصَارَىٰ ۗ قُلْ أَأَنْتُمْ أَعْلَمُ أَمِ اللَّهُ ۗ وَمَنْ أَظْلَمُ مِمَّنْ كَتَمَ شَهَادَةً عِنْدَهُ مِنَ اللَّهِ ۗ وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ',
      english: 'Or do you say that Abraham and Ishmael and Isaac and Jacob and the Descendants were Jews or Christians? Say, "Are you more knowing or is Allah?" And who is more unjust than one who conceals a testimony he has from Allah? And Allah is not unaware of what you do.',
      reference: '[2:140]'
    ),
    Ayat(
      arabic: 'تِلْكَ أُمَّةٌ قَدْ خَلَتْ ۖ لَهَا مَا كَسَبَتْ وَلَكُمْ مَا كَسَبْتُمْ ۖ وَلَا تُسْأَلُونَ عَمَّا كَانُوا يَعْمَلُونَ',
      english: 'That is a nation which has passed on. It will have [the consequence of] what it earned, and you will have what you have earned. And you will not be asked about what they used to do.',
      reference: '[2:141]'
    ),
    Ayat(
      arabic: '۞ سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ مَا وَلَّاهُمْ عَنْ قِبْلَتِهِمُ الَّتِي كَانُوا عَلَيْهَا ۚ قُلْ لِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ يَهْدِي مَنْ يَشَاءُ إِلَىٰ صِرَاطٍ مُسْتَقِيمٍ',
      english: 'The foolish among the people will say, "What has turned them away from their qiblah, which they used to face?" Say, "To Allah belongs the east and the west. He guides whom He wills to a straight path."',
      reference: '[2:142]'
    ),
    Ayat(
      arabic: 'وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا لِتَكُونُوا شُهَدَاءَ عَلَى النَّاسِ وَيَكُونَ الرَّسُولُ عَلَيْكُمْ شَهِيدًا ۗ وَمَا جَعَلْنَا الْقِبْلَةَ الَّتِي كُنْتَ عَلَيْهَا إِلَّا لِنَعْلَمَ مَنْ يَتَّبِعُ الرَّسُولَ مِمَّنْ يَنْقَلِبُ عَلَىٰ عَقِبَيْهِ ۚ وَإِنْ كَانَتْ لَكَبِيرَةً إِلَّا عَلَى الَّذِينَ هَدَى اللَّهُ ۗ وَمَا كَانَ اللَّهُ لِيُضِيعَ إِيمَانَكُمْ ۚ إِنَّ اللَّهَ بِالنَّاسِ لَرَءُوفٌ رَحِيمٌ',
      english: 'And thus we have made you a just community that you will be witnesses over the people and the Messenger will be a witness over you. And We did not make the qiblah which you used to face except that We might make evident who would follow the Messenger from who would turn back on his heels. And indeed, it is difficult except for those whom Allah has guided. And never would Allah have caused you to lose your faith. Indeed Allah is, to the people, Kind and Merciful.',
      reference: '[2:143]'
    ),
    Ayat(
      arabic: 'قَدْ نَرَىٰ تَقَلُّبَ وَجْهِكَ فِي السَّمَاءِ ۖ فَلَنُوَلِّيَنَّكَ قِبْلَةً تَرْضَاهَا ۚ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنْتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ ۗ وَإِنَّ الَّذِينَ أُوتُوا الْكِتَابَ لَيَعْلَمُونَ أَنَّهُ الْحَقُّ مِنْ رَبِّهِمْ ۗ وَمَا اللَّهُ بِغَافِلٍ عَمَّا يَعْمَلُونَ',
      english: 'We have certainly seen the turning of your face, [O Muhammad], toward the heaven, and We will surely turn you to a qiblah with which you will be pleased. So turn your face toward al-Masjid al-Haram. And wherever you [believers] are, turn your faces toward it [in prayer]. Indeed, those who have been given the Scripture well know that it is the truth from their Lord. And Allah is not unaware of what they do.',
      reference: '[2:144]'
    ),
    Ayat(
      arabic: 'وَلَئِنْ أَتَيْتَ الَّذِينَ أُوتُوا الْكِتَابَ بِكُلِّ آيَةٍ مَا تَبِعُوا قِبْلَتَكَ ۚ وَمَا أَنْتَ بِتَابِعٍ قِبْلَتَهُمْ ۚ وَمَا بَعْضُهُمْ بِتَابِعٍ قِبْلَةَ بَعْضٍ ۚ وَلَئِنِ اتَّبَعْتَ أَهْوَاءَهُمْ مِنْ بَعْدِ مَا جَاءَكَ مِنَ الْعِلْمِ ۙ إِنَّكَ إِذًا لَمِنَ الظَّالِمِينَ',
      english: 'And if you brought to those who were given the Scripture every sign, they would not follow your qiblah. Nor will you be a follower of their qiblah. Nor would they be followers of one another\'s qiblah. So if you were to follow their desires after what has come to you of knowledge, indeed, you would then be among the wrongdoers.',
      reference: '[2:145]'
    ),
    Ayat(
      arabic: 'الَّذِينَ آتَيْنَاهُمُ الْكِتَابَ يَعْرِفُونَهُ كَمَا يَعْرِفُونَ أَبْنَاءَهُمْ ۖ وَإِنَّ فَرِيقًا مِنْهُمْ لَيَكْتُمُونَ الْحَقَّ وَهُمْ يَعْلَمُونَ',
      english: 'Those to whom We gave the Scripture know him as they know their own sons. But indeed, a party of them conceal the truth while they know [it].',
      reference: '[2:146]'
    ),
    Ayat(
      arabic: 'الْحَقُّ مِنْ رَبِّكَ ۖ فَلَا تَكُونَنَّ مِنَ الْمُمْتَرِينَ',
      english: 'The truth is from your Lord, so never be among the doubters.',
      reference: '[2:147]'
    ),
    Ayat(
      arabic: 'وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ۖ فَاسْتَبِقُوا الْخَيْرَاتِ ۚ أَيْنَ مَا تَكُونُوا يَأْتِ بِكُمُ اللَّهُ جَمِيعًا ۚ إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      english: 'For each [religious following] is a direction toward which it faces. So race to [all that is] good. Wherever you may be, Allah will bring you forth [for judgement] all together. Indeed, Allah is over all things competent.',
      reference: '[2:148]'
    ),
    Ayat(
      arabic: 'وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۖ وَإِنَّهُ لَلْحَقُّ مِنْ رَبِّكَ ۗ وَمَا اللَّهُ بِغَافِلٍ عَمَّا تَعْمَلُونَ',
      english: 'So from wherever you go out [for prayer, O Muhammad] turn your face toward al- Masjid al-Haram, and indeed, it is the truth from your Lord. And Allah is not unaware of what you do.',
      reference: '[2:149]'
    ),
    Ayat(
      arabic: 'وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنْتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ لِئَلَّا يَكُونَ لِلنَّاسِ عَلَيْكُمْ حُجَّةٌ إِلَّا الَّذِينَ ظَلَمُوا مِنْهُمْ فَلَا تَخْشَوْهُمْ وَاخْشَوْنِي وَلِأُتِمَّ نِعْمَتِي عَلَيْكُمْ وَلَعَلَّكُمْ تَهْتَدُونَ',
      english: 'And from wherever you go out [for prayer], turn your face toward al-Masjid al-Haram. And wherever you [believers] may be, turn your faces toward it in order that the people will not have any argument against you, except for those of them who commit wrong; so fear them not but fear Me. And [it is] so I may complete My favor upon you and that you may be guided.',
      reference: '[2:150]'
    ),
    Ayat(
      arabic: 'كَمَا أَرْسَلْنَا فِيكُمْ رَسُولًا مِنْكُمْ يَتْلُو عَلَيْكُمْ آيَاتِنَا وَيُزَكِّيكُمْ وَيُعَلِّمُكُمُ الْكِتَابَ وَالْحِكْمَةَ وَيُعَلِّمُكُمْ مَا لَمْ تَكُونُوا تَعْلَمُونَ',
      english: 'Just as We have sent among you a messenger from yourselves reciting to you Our verses and purifying you and teaching you the Book and wisdom and teaching you that which you did not know.',
      reference: '[2:151]'
    ),
    Ayat(
      arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
      english: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
      reference: '[2:152]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      english: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
      reference: '[2:153]'
    ),
    Ayat(
      arabic: 'وَلَا تَقُولُوا لِمَنْ يُقْتَلُ فِي سَبِيلِ اللَّهِ أَمْوَاتٌ ۚ بَلْ أَحْيَاءٌ وَلَٰكِنْ لَا تَشْعُرُونَ',
      english: 'And do not say about those who are killed in the way of Allah, "They are dead." Rather, they are alive, but you perceive [it] not.',
      reference: '[2:154]'
    ),
    Ayat(
      arabic: 'وَلَنَبْلُوَنَّكُمْ بِشَيْءٍ مِنَ الْخَوْفِ وَالْجُوعِ وَنَقْصٍ مِنَ الْأَمْوَالِ وَالْأَنْفُسِ وَالثَّمَرَاتِ ۗ وَبَشِّرِ الصَّابِرِينَ',
      english: 'And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient,',
      reference: '[2:155]'
    ),
    Ayat(
      arabic: 'الَّذِينَ إِذَا أَصَابَتْهُمْ مُصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
      english: 'Who, when disaster strikes them, say, "Indeed we belong to Allah, and indeed to Him we will return."',
      reference: '[2:156]'
    ),
    Ayat(
      arabic: 'أُولَٰئِكَ عَلَيْهِمْ صَلَوَاتٌ مِنْ رَبِّهِمْ وَرَحْمَةٌ ۖ وَأُولَٰئِكَ هُمُ الْمُهْتَدُونَ',
      english: 'Those are the ones upon whom are blessings from their Lord and mercy. And it is those who are the [rightly] guided.',
      reference: '[2:157]'
    ),
    Ayat(
      arabic: '۞ إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَنْ يَطَّوَّفَ بِهِمَا ۚ وَمَنْ تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ',
      english: 'Indeed, as-Safa and al-Marwah are among the symbols of Allah. So whoever makes Hajj to the House or performs \'umrah - there is no blame upon him for walking between them. And whoever volunteers good - then indeed, Allah is appreciative and Knowing.',
      reference: '[2:158]'
    ),
    Ayat(
      arabic: 'إِنَّ الَّذِينَ يَكْتُمُونَ مَا أَنْزَلْنَا مِنَ الْبَيِّنَاتِ وَالْهُدَىٰ مِنْ بَعْدِ مَا بَيَّنَّاهُ لِلنَّاسِ فِي الْكِتَابِ ۙ أُولَٰئِكَ يَلْعَنُهُمُ اللَّهُ وَيَلْعَنُهُمُ اللَّاعِنُونَ',
      english: 'Indeed, those who conceal what We sent down of clear proofs and guidance after We made it clear for the people in the Scripture - those are cursed by Allah and cursed by those who curse,',
      reference: '[2:159]'
    ),
    Ayat(
      arabic: 'إِلَّا الَّذِينَ تَابُوا وَأَصْلَحُوا وَبَيَّنُوا فَأُولَٰئِكَ أَتُوبُ عَلَيْهِمْ ۚ وَأَنَا التَّوَّابُ الرَّحِيمُ',
      english: 'Except for those who repent and correct themselves and make evident [what they concealed]. Those - I will accept their repentance, and I am the Accepting of repentance, the Merciful.',
      reference: '[2:160]'
    ),
    Ayat(
      arabic: 'إِنَّ الَّذِينَ كَفَرُوا وَمَاتُوا وَهُمْ كُفَّارٌ أُولَٰئِكَ عَلَيْهِمْ لَعْنَةُ اللَّهِ وَالْمَلَائِكَةِ وَالنَّاسِ أَجْمَعِينَ',
      english: 'Indeed, those who disbelieve and die while they are disbelievers - upon them will be the curse of Allah and of the angels and the people, all together,',
      reference: '[2:161]'
    ),
    Ayat(
      arabic: 'خَالِدِينَ فِيهَا ۖ لَا يُخَفَّفُ عَنْهُمُ الْعَذَابُ وَلَا هُمْ يُنْظَرُونَ',
      english: 'Abiding eternally therein. The punishment will not be lightened for them, nor will they be reprieved.',
      reference: '[2:162]'
    ),
    Ayat(
      arabic: 'وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ',
      english: 'And your god is one God. There is no deity [worthy of worship] except Him, the Entirely Merciful, the Especially Merciful.',
      reference: '[2:163]'
    ),
    Ayat(
      arabic: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ وَالْفُلْكِ الَّتِي تَجْرِي فِي الْبَحْرِ بِمَا يَنْفَعُ النَّاسَ وَمَا أَنْزَلَ اللَّهُ مِنَ السَّمَاءِ مِنْ مَاءٍ فَأَحْيَا بِهِ الْأَرْضَ بَعْدَ مَوْتِهَا وَبَثَّ فِيهَا مِنْ كُلِّ دَابَّةٍ وَتَصْرِيفِ الرِّيَاحِ وَالسَّحَابِ الْمُسَخَّرِ بَيْنَ السَّمَاءِ وَالْأَرْضِ لَآيَاتٍ لِقَوْمٍ يَعْقِلُونَ',
      english: 'Indeed, in the creation of the heavens and earth, and the alternation of the night and the day, and the [great] ships which sail through the sea with that which benefits people, and what Allah has sent down from the heavens of rain, giving life thereby to the earth after its lifelessness and dispersing therein every [kind of] moving creature, and [His] directing of the winds and the clouds controlled between the heaven and the earth are signs for a people who use reason.',
      reference: '[2:164]'
    ),
    Ayat(
      arabic: 'وَمِنَ النَّاسِ مَنْ يَتَّخِذُ مِنْ دُونِ اللَّهِ أَنْدَادًا يُحِبُّونَهُمْ كَحُبِّ اللَّهِ ۖ وَالَّذِينَ آمَنُوا أَشَدُّ حُبًّا لِلَّهِ ۗ وَلَوْ يَرَى الَّذِينَ ظَلَمُوا إِذْ يَرَوْنَ الْعَذَابَ أَنَّ الْقُوَّةَ لِلَّهِ جَمِيعًا وَأَنَّ اللَّهَ شَدِيدُ الْعَذَابِ',
      english: 'And [yet], among the people are those who take other than Allah as equals [to Him]. They love them as they [should] love Allah. But those who believe are stronger in love for Allah. And if only they who have wronged would consider [that] when they see the punishment, [they will be certain] that all power belongs to Allah and that Allah is severe in punishment.',
      reference: '[2:165]'
    ),
    Ayat(
      arabic: 'إِذْ تَبَرَّأَ الَّذِينَ اتُّبِعُوا مِنَ الَّذِينَ اتَّبَعُوا وَرَأَوُا الْعَذَابَ وَتَقَطَّعَتْ بِهِمُ الْأَسْبَابُ',
      english: '[And they should consider that] when those who have been followed disassociate themselves from those who followed [them], and they [all] see the punishment, and cut off from them are the ties [of relationship],',
      reference: '[2:166]'
    ),
    Ayat(
      arabic: 'وَقَالَ الَّذِينَ اتَّبَعُوا لَوْ أَنَّ لَنَا كَرَّةً فَنَتَبَرَّأَ مِنْهُمْ كَمَا تَبَرَّءُوا مِنَّا ۗ كَذَٰلِكَ يُرِيهِمُ اللَّهُ أَعْمَالَهُمْ حَسَرَاتٍ عَلَيْهِمْ ۖ وَمَا هُمْ بِخَارِجِينَ مِنَ النَّارِ',
      english: 'Those who followed will say, "If only we had another turn [at worldly life] so we could disassociate ourselves from them as they have disassociated themselves from us." Thus will Allah show them their deeds as regrets upon them. And they are never to emerge from the Fire.',
      reference: '[2:167]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا النَّاسُ كُلُوا مِمَّا فِي الْأَرْضِ حَلَالًا طَيِّبًا وَلَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِ ۚ إِنَّهُ لَكُمْ عَدُوٌّ مُبِينٌ',
      english: 'O mankind, eat from whatever is on earth [that is] lawful and good and do not follow the footsteps of Satan. Indeed, he is to you a clear enemy.',
      reference: '[2:168]'
    ),
    Ayat(
      arabic: 'إِنَّمَا يَأْمُرُكُمْ بِالسُّوءِ وَالْفَحْشَاءِ وَأَنْ تَقُولُوا عَلَى اللَّهِ مَا لَا تَعْلَمُونَ',
      english: 'He only orders you to evil and immorality and to say about Allah what you do not know.',
      reference: '[2:169]'
    ),
    Ayat(
      arabic: 'وَإِذَا قِيلَ لَهُمُ اتَّبِعُوا مَا أَنْزَلَ اللَّهُ قَالُوا بَلْ نَتَّبِعُ مَا أَلْفَيْنَا عَلَيْهِ آبَاءَنَا ۗ أَوَلَوْ كَانَ آبَاؤُهُمْ لَا يَعْقِلُونَ شَيْئًا وَلَا يَهْتَدُونَ',
      english: 'And when it is said to them, "Follow what Allah has revealed," they say, "Rather, we will follow that which we found our fathers doing." Even though their fathers understood nothing, nor were they guided?',
      reference: '[2:170]'
    ),
    Ayat(
      arabic: 'وَمَثَلُ الَّذِينَ كَفَرُوا كَمَثَلِ الَّذِي يَنْعِقُ بِمَا لَا يَسْمَعُ إِلَّا دُعَاءً وَنِدَاءً ۚ صُمٌّ بُكْمٌ عُمْيٌ فَهُمْ لَا يَعْقِلُونَ',
      english: 'The example of those who disbelieve is like that of one who shouts at what hears nothing but calls and cries cattle or sheep - deaf, dumb and blind, so they do not understand.',
      reference: '[2:171]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُلُوا مِنْ طَيِّبَاتِ مَا رَزَقْنَاكُمْ وَاشْكُرُوا لِلَّهِ إِنْ كُنْتُمْ إِيَّاهُ تَعْبُدُونَ',
      english: 'O you who have believed, eat from the good things which We have provided for you and be grateful to Allah if it is [indeed] Him that you worship.',
      reference: '[2:172]'
    ),
    Ayat(
      arabic: 'إِنَّمَا حَرَّمَ عَلَيْكُمُ الْمَيْتَةَ وَالدَّمَ وَلَحْمَ الْخِنْزِيرِ وَمَا أُهِلَّ بِهِ لِغَيْرِ اللَّهِ ۖ فَمَنِ اضْطُرَّ غَيْرَ بَاغٍ وَلَا عَادٍ فَلَا إِثْمَ عَلَيْهِ ۚ إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ',
      english: 'He has only forbidden to you dead animals, blood, the flesh of swine, and that which has been dedicated to other than Allah. But whoever is forced [by necessity], neither desiring [it] nor transgressing [its limit], there is no sin upon him. Indeed, Allah is Forgiving and Merciful.',
      reference: '[2:173]'
    ),
    Ayat(
      arabic: 'إِنَّ الَّذِينَ يَكْتُمُونَ مَا أَنْزَلَ اللَّهُ مِنَ الْكِتَابِ وَيَشْتَرُونَ بِهِ ثَمَنًا قَلِيلًا ۙ أُولَٰئِكَ مَا يَأْكُلُونَ فِي بُطُونِهِمْ إِلَّا النَّارَ وَلَا يُكَلِّمُهُمُ اللَّهُ يَوْمَ الْقِيَامَةِ وَلَا يُزَكِّيهِمْ وَلَهُمْ عَذَابٌ أَلِيمٌ',
      english: 'Indeed, they who conceal what Allah has sent down of the Book and exchange it for a small price - those consume not into their bellies except the Fire. And Allah will not speak to them on the Day of Resurrection, nor will He purify them. And they will have a painful punishment.',
      reference: '[2:174]'
    ),
    Ayat(
      arabic: 'أُولَٰئِكَ الَّذِينَ اشْتَرَوُا الضَّلَالَةَ بِالْهُدَىٰ وَالْعَذَابَ بِالْمَغْفِرَةِ ۚ فَمَا أَصْبَرَهُمْ عَلَى النَّارِ',
      english: 'Those are the ones who have exchanged guidance for error and forgiveness for punishment. How patient they are in pursuit of the Fire!',
      reference: '[2:175]'
    ),
    Ayat(
      arabic: 'ذَٰلِكَ بِأَنَّ اللَّهَ نَزَّلَ الْكِتَابَ بِالْحَقِّ ۗ وَإِنَّ الَّذِينَ اخْتَلَفُوا فِي الْكِتَابِ لَفِي شِقَاقٍ بَعِيدٍ',
      english: 'That is [deserved by them] because Allah has sent down the Book in truth. And indeed, those who differ over the Book are in extreme dissension.',
      reference: '[2:176]'
    ),
    Ayat(
      arabic: '۞ لَيْسَ الْبِرَّ أَنْ تُوَلُّوا وُجُوهَكُمْ قِبَلَ الْمَشْرِقِ وَالْمَغْرِبِ وَلَٰكِنَّ الْبِرَّ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَالْمَلَائِكَةِ وَالْكِتَابِ وَالنَّبِيِّينَ وَآتَى الْمَالَ عَلَىٰ حُبِّهِ ذَوِي الْقُرْبَىٰ وَالْيَتَامَىٰ وَالْمَسَاكِينَ وَابْنَ السَّبِيلِ وَالسَّائِلِينَ وَفِي الرِّقَابِ وَأَقَامَ الصَّلَاةَ وَآتَى الزَّكَاةَ وَالْمُوفُونَ بِعَهْدِهِمْ إِذَا عَاهَدُوا ۖ وَالصَّابِرِينَ فِي الْبَأْسَاءِ وَالضَّرَّاءِ وَحِينَ الْبَأْسِ ۗ أُولَٰئِكَ الَّذِينَ صَدَقُوا ۖ وَأُولَٰئِكَ هُمُ الْمُتَّقُونَ',
      english: 'Righteousness is not that you turn your faces toward the east or the west, but [true] righteousness is [in] one who believes in Allah, the Last Day, the angels, the Book, and the prophets and gives wealth, in spite of love for it, to relatives, orphans, the needy, the traveler, those who ask [for help], and for freeing slaves; [and who] establishes prayer and gives zakah; [those who] fulfill their promise when they promise; and [those who] are patient in poverty and hardship and during battle. Those are the ones who have been true, and it is those who are the righteous.',
      reference: '[2:177]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الْقِصَاصُ فِي الْقَتْلَى ۖ الْحُرُّ بِالْحُرِّ وَالْعَبْدُ بِالْعَبْدِ وَالْأُنْثَىٰ بِالْأُنْثَىٰ ۚ فَمَنْ عُفِيَ لَهُ مِنْ أَخِيهِ شَيْءٌ فَاتِّبَاعٌ بِالْمَعْرُوفِ وَأَدَاءٌ إِلَيْهِ بِإِحْسَانٍ ۗ ذَٰلِكَ تَخْفِيفٌ مِنْ رَبِّكُمْ وَرَحْمَةٌ ۗ فَمَنِ اعْتَدَىٰ بَعْدَ ذَٰلِكَ فَلَهُ عَذَابٌ أَلِيمٌ',
      english: 'O you who have believed, prescribed for you is legal retribution for those murdered - the free for the free, the slave for the slave, and the female for the female. But whoever overlooks from his brother anything, then there should be a suitable follow-up and payment to him with good conduct. This is an alleviation from your Lord and a mercy. But whoever transgresses after that will have a painful punishment.',
      reference: '[2:178]'
    ),
    Ayat(
      arabic: 'وَلَكُمْ فِي الْقِصَاصِ حَيَاةٌ يَا أُولِي الْأَلْبَابِ لَعَلَّكُمْ تَتَّقُونَ',
      english: 'And there is for you in legal retribution [saving of] life, O you [people] of understanding, that you may become righteous.',
      reference: '[2:179]'
    ),
    Ayat(
      arabic: 'كُتِبَ عَلَيْكُمْ إِذَا حَضَرَ أَحَدَكُمُ الْمَوْتُ إِنْ تَرَكَ خَيْرًا الْوَصِيَّةُ لِلْوَالِدَيْنِ وَالْأَقْرَبِينَ بِالْمَعْرُوفِ ۖ حَقًّا عَلَى الْمُتَّقِينَ',
      english: 'Prescribed for you when death approaches [any] one of you if he leaves wealth [is that he should make] a bequest for the parents and near relatives according to what is acceptable - a duty upon the righteous.',
      reference: '[2:180]'
    ),
    Ayat(
      arabic: 'فَمَنْ بَدَّلَهُ بَعْدَمَا سَمِعَهُ فَإِنَّمَا إِثْمُهُ عَلَى الَّذِينَ يُبَدِّلُونَهُ ۚ إِنَّ اللَّهَ سَمِيعٌ عَلِيمٌ',
      english: 'Then whoever alters the bequest after he has heard it - the sin is only upon those who have altered it. Indeed, Allah is Hearing and Knowing.',
      reference: '[2:181]'
    ),
    Ayat(
      arabic: 'فَمَنْ خَافَ مِنْ مُوصٍ جَنَفًا أَوْ إِثْمًا فَأَصْلَحَ بَيْنَهُمْ فَلَا إِثْمَ عَلَيْهِ ۚ إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ',
      english: 'But if one fears from the bequeather [some] error or sin and corrects that which is between them, there is no sin upon him. Indeed, Allah is Forgiving and Merciful.',
      reference: '[2:182]'
    ),
    Ayat(
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
      english: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous -',
      reference: '[2:183]'
    ),
    Ayat(
      arabic: 'أَيَّامًا مَعْدُودَاتٍ ۚ فَمَنْ كَانَ مِنْكُمْ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِنْ أَيَّامٍ أُخَرَ ۚ وَعَلَى الَّذِينَ يُطِيقُونَهُ فِدْيَةٌ طَعَامُ مِسْكِينٍ ۖ فَمَنْ تَطَوَّعَ خَيْرًا فَهُوَ خَيْرٌ لَهُ ۚ وَأَنْ تَصُومُوا خَيْرٌ لَكُمْ ۖ إِنْ كُنْتُمْ تَعْلَمُونَ',
      english: '[Fasting for] a limited number of days. So whoever among you is ill or on a journey [during them] - then an equal number of days [are to be made up]. And upon those who are able [to fast, but with hardship] - a ransom [as substitute] of feeding a poor person [each day]. And whoever volunteers excess - it is better for him. But to fast is best for you, if you only knew.',
      reference: '[2:184]'
    ),
    Ayat(
      arabic: 'شَهْرُ رَمَضَانَ الَّذِي أُنْزِلَ فِيهِ الْقُرْآنُ هُدًى لِلنَّاسِ وَبَيِّنَاتٍ مِنَ الْهُدَىٰ وَالْفُرْقَانِ ۚ فَمَنْ شَهِدَ مِنْكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَنْ كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِنْ أَيَّامٍ أُخَرَ ۗ يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ وَلِتُكْمِلُوا الْعِدَّةَ وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ',
      english: 'The month of Ramadhan [is that] in which was revealed the Qur\'an, a guidance for the people and clear proofs of guidance and criterion. So whoever sights [the new moon of] the month, let him fast it; and whoever is ill or on a journey - then an equal number of other days. Allah intends for you ease and does not intend for you hardship and [wants] for you to complete the period and to glorify Allah for that [to] which He has guided you; and perhaps you will be grateful.',
      reference: '[2:185]'
    ),
    Ayat(
      arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ',
      english: 'And when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me [by obedience] and believe in Me that they may be [rightly] guided.',
      reference: '[2:186]'
    ),
    Ayat(
      arabic: 'أُحِلَّ لَكُمْ لَيْلَةَ الصِّيَامِ الرَّفَثُ إِلَىٰ نِسَائِكُمْ ۚ هُنَّ لِبَاسٌ لَكُمْ وَأَنْتُمْ لِبَاسٌ لَهُنَّ ۗ عَلِمَ اللَّهُ أَنَّكُمْ كُنْتُمْ تَخْتَانُونَ أَنْفُسَكُمْ فَتَابَ عَلَيْكُمْ وَعَفَا عَنْكُمْ ۖ فَالْآنَ بَاشِرُوهُنَّ وَابْتَغُوا مَا كَتَبَ اللَّهُ لَكُمْ ۚ وَكُلُوا وَاشْرَبُوا حَتَّىٰ يَتَبَيَّنَ لَكُمُ الْخَيْطُ الْأَبْيَضُ مِنَ الْخَيْطِ الْأَسْوَدِ مِنَ الْفَجْرِ ۖ ثُمَّ أَتِمُّوا الصِّيَامَ إِلَى اللَّيْلِ ۚ وَلَا تُبَاشِرُوهُنَّ وَأَنْتُمْ عَاكِفُونَ فِي الْمَسَاجِدِ ۗ تِلْكَ حُدُودُ اللَّهِ فَلَا تَقْرَبُوهَا ۗ كَذَٰلِكَ يُبَيِّنُ اللَّهُ آيَاتِهِ لِلنَّاسِ لَعَلَّهُمْ يَتَّقُونَ',
      english: 'It has been made permissible for you the night preceding fasting to go to your wives [for sexual relations]. They are clothing for you and you are clothing for them. Allah knows that you used to deceive yourselves, so He accepted your repentance and forgave you. So now, have relations with them and seek that which Allah has decreed for you. And eat and drink until the white thread of dawn becomes distinct to you from the black thread [of night]. Then complete the fast until the sunset. And do not have relations with them as long as you are staying for worship in the mosques. These are the limits [set by] Allah, so do not approach them. Thus does Allah make clear His ordinances to the people that they may become righteous.',
      reference: '[2:187]'
    ),
    Ayat(
      arabic: 'وَلَا تَأْكُلُوا أَمْوَالَكُمْ بَيْنَكُمْ بِالْبَاطِلِ وَتُدْلُوا بِهَا إِلَى الْحُكَّامِ لِتَأْكُلُوا فَرِيقًا مِنْ أَمْوَالِ النَّاسِ بِالْإِثْمِ وَأَنْتُمْ تَعْلَمُونَ',
      english: 'And do not consume one another\'s wealth unjustly or send it [in bribery] to the rulers in order that [they might aid] you [to] consume a portion of the wealth of the people in sin, while you know [it is unlawful].',
      reference: '[2:188]'
    ),
    Ayat(
      arabic: '۞ يَسْأَلُونَكَ عَنِ الْأَهِلَّةِ ۖ قُلْ هِيَ مَوَاقِيتُ لِلنَّاسِ وَالْحَجِّ ۗ وَلَيْسَ الْبِرُّ بِأَنْ تَأْتُوا الْبُيُوتَ مِنْ ظُهُورِهَا وَلَٰكِنَّ الْبِرَّ مَنِ اتَّقَىٰ ۗ وَأْتُوا الْبُيُوتَ مِنْ أَبْوَابِهَا ۚ وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ',
      english: 'They ask you, [O Muhammad], about the new moons. Say, "They are measurements of time for the people and for Hajj." And it is not righteousness to enter houses from the back, but righteousness is [in] one who fears Allah. And enter houses from their doors. And fear Allah that you may succeed.',
      reference: '[2:189]'
    ),
    Ayat(
      arabic: 'وَقَاتِلُوا فِي سَبِيلِ اللَّهِ الَّذِينَ يُقَاتِلُونَكُمْ وَلَا تَعْتَدُوا ۚ إِنَّ اللَّهَ لَا يُحِبُّ الْمُعْتَدِينَ',
      english: 'Fight in the way of Allah those who fight you but do not transgress. Indeed. Allah does not like transgressors.',
      reference: '[2:190]'
    ),
    Ayat(
      arabic: 'وَاقْتُلُوهُمْ حَيْثُ ثَقِفْتُمُوهُمْ وَأَخْرِجُوهُمْ مِنْ حَيْثُ أَخْرَجُوكُمْ ۚ وَالْفِتْنَةُ أَشَدُّ مِنَ الْقَتْلِ ۚ وَلَا تُقَاتِلُوهُمْ عِنْدَ الْمَسْجِدِ الْحَرَامِ حَتَّىٰ يُقَاتِلُوكُمْ فِيهِ ۖ فَإِنْ قَاتَلُوكُمْ فَاقْتُلُوهُمْ ۗ كَذَٰلِكَ جَزَاءُ الْكَافِرِينَ',
      english: 'And kill them wherever you overtake them and expel them from wherever they have expelled you, and fitnah is worse than killing. And do not fight them at al-Masjid al- Haram until they fight you there. But if they fight you, then kill them. Such is the recompense of the disbelievers.',
      reference: '[2:191]'
    ),
    Ayat(
      arabic: 'فَإِنِ انْتَهَوْا فَإِنَّ اللَّهَ غَفُورٌ رَحِيمٌ',
      english: 'And if they cease, then indeed, Allah is Forgiving and Merciful.',
      reference: '[2:192]'
    ),
    Ayat(
      arabic: 'وَقَاتِلُوهُمْ حَتَّىٰ لَا تَكُونَ فِتْنَةٌ وَيَكُونَ الدِّينُ لِلَّهِ ۖ فَإِنِ انْتَهَوْا فَلَا عُدْوَانَ إِلَّا عَلَى الظَّالِمِينَ',
      english: 'Fight them until there is no [more] fitnah and [until] worship is [acknowledged to be] for Allah. But if they cease, then there is to be no aggression except against the oppressors.',
      reference: '[2:193]'
    ),
    Ayat(
      arabic: 'الشَّهْرُ الْحَرَامُ بِالشَّهْرِ الْحَرَامِ وَالْحُرُمَاتُ قِصَاصٌ ۚ فَمَنِ اعْتَدَىٰ عَلَيْكُمْ فَاعْتَدُوا عَلَيْهِ بِمِثْلِ مَا اعْتَدَىٰ عَلَيْكُمْ ۚ وَاتَّقُوا اللَّهَ وَاعْلَمُوا أَنَّ اللَّهَ مَعَ الْمُتَّقِينَ',
      english: '[Fighting in] the sacred month is for [aggression committed in] the sacred month, and for [all] violations is legal retribution. So whoever has assaulted you, then assault him in the same way that he has assaulted you. And fear Allah and know that Allah is with those who fear Him.',
      reference: '[2:194]'
    ),
    Ayat(
      arabic: 'وَأَنْفِقُوا فِي سَبِيلِ اللَّهِ وَلَا تُلْقُوا بِأَيْدِيكُمْ إِلَى التَّهْلُكَةِ ۛ وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ',
      english: 'And spend in the way of Allah and do not throw [yourselves] with your [own] hands into destruction [by refraining]. And do good; indeed, Allah loves the doers of good.',
      reference: '[2:195]'
    ),
    Ayat(
      arabic: 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ ۚ فَإِنْ أُحْصِرْتُمْ فَمَا اسْتَيْسَرَ مِنَ الْهَدْيِ ۖ وَلَا تَحْلِقُوا رُءُوسَكُمْ حَتَّىٰ يَبْلُغَ الْهَدْيُ مَحِلَّهُ ۚ فَمَنْ كَانَ مِنْكُمْ مَرِيضًا أَوْ بِهِ أَذًى مِنْ رَأْسِهِ فَفِدْيَةٌ مِنْ صِيَامٍ أَوْ صَدَقَةٍ أَوْ نُسُكٍ ۚ فَإِذَا أَمِنْتُمْ فَمَنْ تَمَتَّعَ بِالْعُمْرَةِ إِلَى الْحَجِّ فَمَا اسْتَيْسَرَ مِنَ الْهَدْيِ ۚ فَمَنْ لَمْ يَجِدْ فَصِيَامُ ثَلَاثَةِ أَيَّامٍ فِي الْحَجِّ وَسَبْعَةٍ إِذَا رَجَعْتُمْ ۗ تِلْكَ عَشَرَةٌ كَامِلَةٌ ۗ ذَٰلِكَ لِمَنْ لَمْ يَكُنْ أَهْلُهُ حَاضِرِي الْمَسْجِدِ الْحَرَامِ ۚ وَاتَّقُوا اللَّهَ وَاعْلَمُوا أَنَّ اللَّهَ شَدِيدُ الْعِقَابِ',
      english: 'And complete the Hajj and \'umrah for Allah. But if you are prevented, then [offer] what can be obtained with ease of sacrificial animals. And do not shave your heads until the sacrificial animal has reached its place of slaughter. And whoever among you is ill or has an ailment of the head [making shaving necessary must offer] a ransom of fasting [three days] or charity or sacrifice. And when you are secure, then whoever performs \'umrah [during the Hajj months] followed by Hajj [offers] what can be obtained with ease of sacrificial animals. And whoever cannot find [or afford such an animal] - then a fast of three days during Hajj and of seven when you have returned [home]. Those are ten complete [days]. This is for those whose family is not in the area of al-Masjid al-Haram. And fear Allah and know that Allah is severe in penalty.',
      reference: '[2:196]'
    ),
    Ayat(
      arabic: 'الْحَجُّ أَشْهُرٌ مَعْلُومَاتٌ ۚ فَمَنْ فَرَضَ فِيهِنَّ الْحَجَّ فَلَا رَفَثَ وَلَا فُسُوقَ وَلَا جِدَالَ فِي الْحَجِّ ۗ وَمَا تَفْعَلُوا مِنْ خَيْرٍ يَعْلَمْهُ اللَّهُ ۗ وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ ۚ وَاتَّقُونِ يَا أُولِي الْأَلْبَابِ',
      english: 'Hajj is [during] well-known months, so whoever has made Hajj obligatory upon himself therein [by entering the state of ihram], there is [to be for him] no sexual relations and no disobedience and no disputing during Hajj. And whatever good you do - Allah knows it. And take provisions, but indeed, the best provision is fear of Allah. And fear Me, O you of understanding.',
      reference: '[2:197]'
    ),
    Ayat(
      arabic: 'لَيْسَ عَلَيْكُمْ جُنَاحٌ أَنْ تَبْتَغُوا فَضْلًا مِنْ رَبِّكُمْ ۚ فَإِذَا أَفَضْتُمْ مِنْ عَرَفَاتٍ فَاذْكُرُوا اللَّهَ عِنْدَ الْمَشْعَرِ الْحَرَامِ ۖ وَاذْكُرُوهُ كَمَا هَدَاكُمْ وَإِنْ كُنْتُمْ مِنْ قَبْلِهِ لَمِنَ الضَّالِّينَ',
      english: 'There is no blame upon you for seeking bounty from your Lord [during Hajj]. But when you depart from \'Arafat, remember Allah at al- Mash\'ar al-Haram. And remember Him, as He has guided you, for indeed, you were before that among those astray.',
      reference: '[2:198]'
    ),
    Ayat(
      arabic: 'ثُمَّ أَفِيضُوا مِنْ حَيْثُ أَفَاضَ النَّاسُ وَاسْتَغْفِرُوا اللَّهَ ۚ إِنَّ اللَّهَ غَفُورٌ رَحِيمٌ',
      english: 'Then depart from the place from where [all] the people depart and ask forgiveness of Allah. Indeed, Allah is Forgiving and Merciful.',
      reference: '[2:199]'
    ),
    Ayat(
      arabic: 'فَإِذَا قَضَيْتُمْ مَنَاسِكَكُمْ فَاذْكُرُوا اللَّهَ كَذِكْرِكُمْ آبَاءَكُمْ أَوْ أَشَدَّ ذِكْرًا ۗ فَمِنَ النَّاسِ مَنْ يَقُولُ رَبَّنَا آتِنَا فِي الدُّنْيَا وَمَا لَهُ فِي الْآخِرَةِ مِنْ خَلَاقٍ',
      english: 'And when you have completed your rites, remember Allah like your [previous] remembrance of your fathers or with [much] greater remembrance. And among the people is he who says, "Our Lord, give us in this world," and he will have in the Hereafter no share.',
      reference: '[2:200]'
    ),
  ];

  static List<Ayat> getRandomAyats(int count) {
    var random = Random();
    var list = List<Ayat>.from(_ayats);
    list.shuffle(random);
    return list.take(count).toList();
  }
}
