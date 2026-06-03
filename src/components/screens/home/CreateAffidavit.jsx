import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';
import DigitalPersonaScanner from '../../../utils/DigitalPersonaScanner';
import ZKTecoScanner from '../../../utils/ZKTecoScanner';
import FutronicScanner from '../../../utils/FutronicScanner';
import { useAuth } from '../../../contexts/authContext';
import { saveAffidavitData, getCommissioners, getRegistrars } from '../../../utils/database';
import { useNavigate } from 'react-router-dom';

const NIGERIA_STATES_LGA = {
  "Abuja": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"],
  "Abia": ["Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma Ngwa", "Ugwunagbo", "Ukwa East", "Ukwa West", "Umuahia North", "Umuahia South", "Umu Nneochi"],
  "Adamawa": ["Demsa", "Fufure", "Ganye", "Gayuk", "Gombi", "Grie", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo Belwa", "Michika", "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", "Yola North", "Yola South"],
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat Enin", "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung Uko", "Ukanafun", "Uruan", "Urue Offong/Oruko", "Uyo"],
  "Anambra": ["Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"],
  "Bauchi": ["Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"],
  "Bayelsa": ["Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", "Sagbama", "Southern Ijaw", "Yenagoa"],
  "Benue": ["Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Oturkpo", "Tarka", "Ukum", "Ushongo", "Vandeikya"],
  "Borno": ["Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"],
  "Cross River": ["Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"],
  "Delta": ["Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", "Uvwie", "Warri North", "Warri South", "Warri South West"],
  "Ebonyi": ["Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"],
  "Edo": ["Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", "Ikpoba Okha", "Oredo", "Orhionmwon", "Ovia North-East", "Ovia South-West", "Owan East", "Owan West", "Uhunmwonde"],
  "Ekiti": ["Ado Ekiti", "Efon", "Ekiti East", "Ekiti South West", "Ekiti West", "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"],
  "Enugu": ["Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo Uwani"],
  "Gombe": ["Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"],
  "Imo": ["Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", "Owerri North", "Owerri West", "Unuimo"],
  "Jigawa": ["Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari", "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"],
  "Kaduna": ["Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", "Soba", "Zangon Kataf", "Zaria"],
  "Kano": ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", "Garko", "Garum Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", "Ungogo", "Warawa", "Wudil"],
  "Katsina": ["Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", "Dan Musa", "Dandume", "Danja", "Daura", "Dutsi", "Dutsin Ma", "Faskari", "Funtua", "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Matazu", "Musawa", "Rimi", "Sabuwa", "Safana", "Sandamu", "Zango"],
  "Kebbi": ["Aleiro", "Arewa Dandi", "Argungu", "Augie", "Bagudo", "Birnin Kebbi", "Bunza", "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"],
  "Kogi": ["Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"],
  "Kwara": ["Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", "Oyun", "Pategi"],
  "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
  "Nasarawa": ["Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"],
  "Niger": ["Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", "Mariga", "Mashegu", "Mokwa", "Muya", "Paikoro", "Rafi", "Rijau", "Shiroro", "Suleja", "Tafa", "Wushishi"],
  "Ogun": ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Egbado North", "Egbado South", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", "Remo North", "Shagamu"],
  "Ondo": ["Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ile Oluji/Okeigbo", "Ilaje", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", "Ose", "Owo"],
  "Osun": ["Atakunmosa East", "Atakunmosa West", "Aiyedaade", "Aiyedire", "Boluwaduro", "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ifedayo", "Ifelodun", "Ife Central", "Ife East", "Ife North", "Ife South", "Ila", "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"],
  "Oyo": ["Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", "Iseyin", "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", "Oyo", "Oyo East", "Saki East", "Saki West", "Surulere"],
  "Plateau": ["Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"],
  "Rivers": ["Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", "Asari-Toru", "Bonny", "Degema", "Eleme", "Emuoha", "Etche", "Gokana", "Ikwerre", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Oyigbo", "Port Harcourt", "Tai"],
  "Sokoto": ["Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"],
  "Taraba": ["Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim Lamido", "Kumi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing"],
  "Yobe": ["Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"],
  "Zamfara": ["Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", "Talata Mafara", "Tsafe", "Zurmi"]
};

const CreateAffidavit = () => {


  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commissioners, setCommissioners] = useState([]);
  const [registrars, setRegistrars] = useState([]);

  const [passportPreview, setPassportPreview] = useState(null);
  const [fingerprintPreview, setFingerprintPreview] = useState(null);

  // Cropper States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const [signaturePreview, setSignaturePreview] = useState(null);
  const [scannerStatus, setScannerStatus] = useState("Idle");
  const [scannerType, setScannerType] = useState('digitalpersona'); // 'digitalpersona', 'zkteco', or 'futronic'
  
  const [readers, setReaders] = useState([]);
  const [selectedReader, setSelectedReader] = useState("");
  
  const scanner = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    gender: "",
    phoneNumber: "",
    stateOfOrigin: "",
    lga: "",
    familyName: "",
    fathersName: "",
    fathersVillage: "",
    mothersName: "",
    mothersVillage: "",
    affidavitCode: "",
    caseType: "",
    commissionerId: "", // Track selected ID
    commissionerName: "",
    commissionerTitle: "",
    commissionerSignature: null,
    registrarId: "",
    registrarName: "",
    registrarTitle: "",
    registrarSignature: null,
    passportPhoto: null,
    fingerprintData: null
  });

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?.uid) {
        const [commData, regData] = await Promise.all([
          getCommissioners(currentUser.uid),
          getRegistrars(currentUser.uid)
        ]);
        setCommissioners(commData);
        setRegistrars(regData);
      }
    };
    fetchData();

    if (scannerType === 'zkteco') {
      scanner.current = new ZKTecoScanner();
    } else if (scannerType === 'digitalpersona') {
      scanner.current = new DigitalPersonaScanner();
    } else {
      scanner.current = new FutronicScanner(); // Initialize Futronic
    }
    loadReaders();

    return () => {
      if (selectedReader && scanner.current) {
        scanner.current.stopCapture(selectedReader);
      }
    };
  }, [scannerType, currentUser]);

  const loadReaders = async () => {
    try {
      const list = await scanner.current.getReaders();
      setReaders(list);
      if (list.length > 0) {
        setSelectedReader(list[0]);
        setScannerStatus("Ready");
      } else {
        setScannerStatus("No scanner detected");
      }
    } catch (err) {
      setScannerStatus("Scanner Error");
    }
  };

  const handleStartScan = async () => {
    if (!selectedReader) {
      Swal.fire({
        icon: 'warning',
        title: 'Scanner Required',
        text: 'Please select a fingerprint reader first.',
      });
      return;
    }

    setScannerStatus("Scanning...");
    try {
      await scanner.current.startCapture(
        selectedReader,
        window.Fingerprint.SampleFormat.PngImage,
        (sample) => {
          // Normalize base64 across different scanner outputs
          let base64Image = sample;
          if (typeof sample === 'string' && !sample.startsWith('data:image')) {
            const normalized = sample.replace(/_/g, '/').replace(/-/g, '+');
            base64Image = "data:image/png;base64," + normalized;
          }
          
          setFingerprintPreview(base64Image);
          setFormData(prev => ({ ...prev, fingerprintData: base64Image }));
          setScannerStatus("Captured Successfully");
          Swal.fire({
            icon: 'success',
            title: 'Fingerprint Captured',
            timer: 1500,
            showConfirmButton: false
          });
        },
        (quality) => setScannerStatus(`Quality: ${quality}`)
      );
    } catch (err) {
      setScannerStatus("Scan Failed");
      Swal.fire({
        icon: 'error',
        title: 'Scan Failed',
        text: err.message,
      });
    }
  };

  // Image Cropping Helpers
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handlePassportChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      const croppedFile = new File([croppedImageBlob], "passport.jpg", { type: "image/jpeg" });

      setPassportPreview(croppedImageUrl);
      setFormData(prev => ({ ...prev, passportPhoto: croppedFile }));
      setShowCropModal(false);
      setImageToCrop(null);
    } catch (e) {
      Swal.fire('Error', 'Failed to crop image', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stateOfOrigin') {
      setFormData(prev => ({ ...prev, [name]: value, lga: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // const handlePassportChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setPassportPreview(URL.createObjectURL(file));
  //     setFormData(prev => ({ ...prev, passportPhoto: file }));
  //   }
  // };

  const handleCommissionerSelect = (e) => {
    const selected = commissioners.find(c => c.id === e.target.value);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        commissionerId: selected.id,
        commissionerName: selected.name,
        commissionerTitle: selected.court,
        commissionerSignature: selected.signature // Assuming URL or reference
      }));
    }
  };

  const handleRegistrarSelect = (e) => {
    const selected = registrars.find(r => r.id === e.target.value);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        registrarId: selected.id,
        registrarName: selected.name,
        registrarTitle: selected.title,
        registrarSignature: selected.signature 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.passportPhoto) {
      return Swal.fire('Missing Photo', 'Please upload a passport photo.', 'warning');
    }
    // if (!formData.fingerprintData) {
    //   return Swal.fire('Missing Biometrics', 'Please capture a fingerprint scan.', 'warning');
    // }

    if (!formData.commissionerSignature) {
      return Swal.fire('Missing Photo', 'Please upload a commissioner signature photo.', 'warning');
    }


    setIsSubmitting(true);
    try {
      const docId = await saveAffidavitData(currentUser, formData);

      console.log("Affidavit saved with ID:", docId);
      // Swal.fire({
      //   icon: 'success',
      //   title: 'Saved Successfully',
      //   text: `Affidavit ID: ${docId}`,
      //   confirmButtonColor: '#0d6efd'
      // });
      
      navigate(`/home/view/${docId}`);
      handleReset();
    } catch (err) {
      console.error("Error saving affidavit:", err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPassportPreview(null);
    setFingerprintPreview(null);
    setSignaturePreview(null);
    setScannerStatus("Idle");
    setImageToCrop(null);
    setShowCropModal(false);

    setFormData({
      fullName: '', nin: '', address: '', gender: '', phoneNumber: '',
      stateOfOrigin: '', lga: '', familyName: '', fathersName: '',
      fathersVillage: '', mothersName: '', mothersVillage: '',
      affidavitCode: '', caseType: '', commissionerName: '', 
      commissionerId: '', commissionerTitle: '', commissionerSignature: null, 
      registrarId: '', registrarName: '', registrarTitle: '', registrarSignature: null,
      passportPhoto: null, fingerprintData: null
    });
  };

  const RequiredLabel = ({ children, optional = false }) => (
    <label className="form-label">
      {children} {!optional && <span className="text-danger">*</span>}
    </label>
  );

  return (
    <div className="card shadow-sm p-4 border-0">
      {/* Crop Modal Overlay */}
      { showCropModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1060, background: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-white p-4 rounded-4 shadow-lg" style={{ width: '95%', maxWidth: '550px' }}>
            <h5 className="mb-3 fw-bold">Crop Passport Photo</h5>
            <div className="position-relative mb-3 border rounded overflow-hidden" style={{ height: '350px', background: '#f8f9fa' }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="mb-4">
              <label className="form-label small text-muted">Zoom Control</label>
              <input type="range" className="form-range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light px-4" onClick={() => setShowCropModal(false)}>Cancel</button>
              <button type="button" className="btn btn-primary px-4" onClick={handleCropSave}>Apply & Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3>Create New Affidavit</h3>
        <p className="text-muted">Fill in the details below. Fields marked with <span className="text-danger">*</span> are required.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Passport Section */}
          <div className="col-md-6 text-center">
            <RequiredLabel>Passport Photo</RequiredLabel>
            <div className="border rounded p-2 bg-light mb-2 mt-2 d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
              {passportPreview ? (
                <img src={passportPreview} alt="Passport Preview" className="img-fluid rounded" style={{ maxHeight: '100%' }} />
              ) : (
                <div className="text-muted small">
                  <i className="bi bi-person-bounding-box fs-1 d-block mb-2"></i>
                  No photo uploaded
                </div>
              )}
            </div>
            <input type="file" className="form-control form-control-sm" accept="image/*" onChange={handlePassportChange} required/>
          </div>

          {/* Biometric Section */}
          <div className="col-md-6 text-center">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <RequiredLabel>Thumb Scan Preview</RequiredLabel>
              <div className="btn-group btn-group-sm" role="group">
                <button 
                  type="button" 
                  className={`btn ${scannerType === 'digitalpersona' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setScannerType('digitalpersona')}
                >
                  Digital Persona
                </button>
                <button 
                  type="button" 
                  className={`btn ${scannerType === 'futronic' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setScannerType('futronic')}
                >
                  Futronic
                </button>
                <button 
                  type="button" 
                  className={`btn ${scannerType === 'zkteco' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setScannerType('zkteco')}
                >
                  ZKTeco
                </button>
              </div>
            </div>
            <div className="border rounded p-2 bg-light d-flex align-items-center justify-content-center mb-2" style={{ height: '200px' }}>
              {fingerprintPreview ? (
                <img src={fingerprintPreview} alt="Fingerprint Preview" className="img-fluid" style={{ maxHeight: '100%' }} />
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-fingerprint fs-1 d-block mb-2 text-primary opacity-50"></i>
                  <span className="small">Status: {scannerStatus}</span>
                </div>
              )}
            </div>

            <div className="row g-2">
              <div className="col-7">
                <select 
                  className="form-select form-select-sm" 
                  value={selectedReader} 
                  onChange={(e) => setSelectedReader(e.target.value)}
                >
                  {readers.length === 0 && <option value="">No Reader Found</option>}
                  {readers.map((reader, index) => (
                    <option key={index} value={reader}>{reader}</option>
                  ))}
                </select>
              </div>
              <div className='col-1 text-end'>
                <button type="button" onClick={loadReaders} className="btn btn-sm btn-outline-primary w-100" title="Refresh Readers">
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
              <div className="col-4 text-end">
                <button type="button" onClick={handleStartScan} className="btn btn-sm btn-primary w-100 shadow-sm">
                  {fingerprintPreview ? "Rescan Fingerprint" : "Start Scan"}
                </button>
              </div>
            </div>
          </div>

          <hr className="my-4 text-muted opacity-25" />

          {/* Form Inputs */}
          <div className="col-md-6">
            <RequiredLabel>Full Name</RequiredLabel>
            <input name="fullName" type="text" className="form-control" value={formData.fullName} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <RequiredLabel>NIN (National Identification Number)</RequiredLabel>
            <input name="nin" type="text" className="form-control" placeholder="11-digit NIN" maxLength="11" value={formData.nin} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <RequiredLabel>Address</RequiredLabel>
            <input name="address" type="text" className="form-control" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="col-md-6">
            <RequiredLabel>Gender</RequiredLabel>
            <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-md-6">
            <RequiredLabel>Phone Number</RequiredLabel>
            <input name="phoneNumber" type="tel" className="form-control" value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <div className="col-md-6">
            <RequiredLabel>State of Origin</RequiredLabel>
            <select name="stateOfOrigin" className="form-select" value={formData.stateOfOrigin} onChange={handleChange} required>
              <option value="">Select State</option>
              {Object.keys(NIGERIA_STATES_LGA).sort().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <RequiredLabel>LGA</RequiredLabel>
            <select name="lga" className="form-select" value={formData.lga} onChange={handleChange} required disabled={!formData.stateOfOrigin}>
              <option value="">Select LGA</option>
              {formData.stateOfOrigin && NIGERIA_STATES_LGA[formData.stateOfOrigin].sort().map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <RequiredLabel optional>Family Name (Optional)</RequiredLabel>
            <input name="familyName" type="text" className="form-control" value={formData.familyName} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <RequiredLabel>Father’s Name</RequiredLabel>
            <input name="fathersName" type="text" className="form-control" value={formData.fathersName} onChange={handleChange} required />
          </div>

          <div className="col-md-6">
            <RequiredLabel>Name of Father’s Village</RequiredLabel>
            <input name="fathersVillage" type="text" className="form-control" value={formData.fathersVillage} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <RequiredLabel>Mother’s Name</RequiredLabel>
            <input name="mothersName" type="text" className="form-control" value={formData.mothersName} onChange={handleChange} required />
          </div>

          <div className="col-md-6">
            <RequiredLabel>Name of Mother’s Village</RequiredLabel>
            <input name="mothersVillage" type="text" className="form-control" value={formData.mothersVillage} onChange={handleChange} required />
          </div>
          {/* <div className="col-md-6">
            <RequiredLabel>Affidavit Code</RequiredLabel>
            <input name="affidavitCode" type="text" className="form-control" value={formData.affidavitCode} onChange={handleChange} required />
          </div> */}

          {/* <div className="col-md-12">
            <div className="alert alert-info py-2 small border-0 shadow-none mb-0">
              <i className="bi bi-info-circle me-2"></i>
              The <strong>Affidavit ID</strong> (e.g., FCT-2026-000001) will be automatically generated upon saving.
            </div>
          </div> */}

          <div className="col-md-12">
            <RequiredLabel>Type of Case</RequiredLabel>
            <select name="caseType" className="form-select" value={formData.caseType} onChange={handleChange} required>
              <option value="">Select Case Type</option>
              <option value="name_change">Name Change</option>
              <option value="age_declaration">Age Declaration</option>
              <option value="loss_of_document">Loss of Documents</option>
              <option value="next_of_kin">Next of Kin</option>
            </select>
          </div>

          <div className="col-md-6">
            <RequiredLabel>Select Commissioner of Oaths</RequiredLabel>
            <select 
              name="commissionerId" 
              className="form-select" 
              value={formData.commissionerId} 
              onChange={handleCommissionerSelect} 
              required
            >
              <option value="">-- Choose Commissioner --</option>
              {commissioners.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.court})</option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <RequiredLabel>Select Registrar</RequiredLabel>
            <select 
              name="registrarId" 
              className="form-select" 
              value={formData.registrarId} 
              onChange={handleRegistrarSelect} 
              required
            >
              <option value="">-- Choose Registrar --</option>
              {registrars.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.title})</option>
              ))}
            </select>
          </div>

          {/* <div className="col-md-4">
            <RequiredLabel>Commissioner of Oaths Name</RequiredLabel>
            <input name="commissionerName" type="text" className="form-control" value={formData.commissionerName} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <RequiredLabel>Commissioner of Oaths Court</RequiredLabel>
            <input name="commissionerTitle" type="text" className="form-control" placeholder="e.g. High Court of The FCT Abuja" value={formData.commissionerTitle} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <RequiredLabel>Commissioner of Oaths Signature (Upload)</RequiredLabel>
            <input type="file" className="form-control" accept="image/*" onChange={handleSignatureChange} required/>
            {signaturePreview && (
              <div className="mt-2 text-center">
                <img src={signaturePreview} alt="Signature Preview" className="img-thumbnail" style={{ height: '50px' }} />
              </div>
            )}
          </div> */}
          
        </div>

        <div className="mt-5 d-flex justify-content-end border-top pt-4">
          <button type="button" className="btn btn-light me-2" onClick={handleReset}>Clear Form</button>
          <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={isSubmitting}>
            { isSubmitting ? "Saving..." : "Generate & Save" }
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAffidavit;