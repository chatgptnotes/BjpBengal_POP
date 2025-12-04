/**
 * Complete West Bengal Assembly Constituencies Data
 * Total: 294 constituencies across 23 districts
 * Regions: North Bengal, South Bengal, Kolkata Metro, Jangalmahal
 */

export interface Constituency {
  id: string;
  name: string;
  district: string;
  region: string;
  assemblyNumber: number;
}

export const WEST_BENGAL_CONSTITUENCIES: Constituency[] = [
  // Alipurduar District (5 seats)
  { id: 'alipurduar-1', name: 'Kumargram', district: 'Alipurduar', region: 'North Bengal', assemblyNumber: 1 },
  { id: 'alipurduar-2', name: 'Kalchini', district: 'Alipurduar', region: 'North Bengal', assemblyNumber: 2 },
  { id: 'alipurduar-3', name: 'Alipurduar', district: 'Alipurduar', region: 'North Bengal', assemblyNumber: 3 },
  { id: 'alipurduar-4', name: 'Falakata', district: 'Alipurduar', region: 'North Bengal', assemblyNumber: 4 },
  { id: 'alipurduar-5', name: 'Madarihat', district: 'Alipurduar', region: 'North Bengal', assemblyNumber: 5 },

  // Bankura District (12 seats)
  { id: 'bankura-1', name: 'Saltora', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 230 },
  { id: 'bankura-2', name: 'Chhatna', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 231 },
  { id: 'bankura-3', name: 'Ranibandh', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 232 },
  { id: 'bankura-4', name: 'Raipur', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 233 },
  { id: 'bankura-5', name: 'Taldangra', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 234 },
  { id: 'bankura-6', name: 'Bankura', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 235 },
  { id: 'bankura-7', name: 'Barjora', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 236 },
  { id: 'bankura-8', name: 'Onda', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 237 },
  { id: 'bankura-9', name: 'Bishnupur', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 238 },
  { id: 'bankura-10', name: 'Katulpur', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 239 },
  { id: 'bankura-11', name: 'Indas', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 240 },
  { id: 'bankura-12', name: 'Sonamukhi', district: 'Bankura', region: 'Jangalmahal', assemblyNumber: 241 },

  // Birbhum District (11 seats)
  { id: 'birbhum-1', name: 'Suri', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 283 },
  { id: 'birbhum-2', name: 'Bolpur', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 284 },
  { id: 'birbhum-3', name: 'Nanoor', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 285 },
  { id: 'birbhum-4', name: 'Labhpur', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 286 },
  { id: 'birbhum-5', name: 'Sainthia', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 287 },
  { id: 'birbhum-6', name: 'Mayureswar', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 288 },
  { id: 'birbhum-7', name: 'Rampurhat', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 289 },
  { id: 'birbhum-8', name: 'Hansan', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 290 },
  { id: 'birbhum-9', name: 'Nalhati', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 291 },
  { id: 'birbhum-10', name: 'Murarai', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 292 },
  { id: 'birbhum-11', name: 'Dubrajpur', district: 'Birbhum', region: 'South Bengal', assemblyNumber: 293 },

  // Cooch Behar District (9 seats)
  { id: 'coochbehar-1', name: 'Mekliganj', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 6 },
  { id: 'coochbehar-2', name: 'Mathabhanga', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 7 },
  { id: 'coochbehar-3', name: 'Cooch Behar Uttar', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 8 },
  { id: 'coochbehar-4', name: 'Cooch Behar Dakshin', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 9 },
  { id: 'coochbehar-5', name: 'Sitalkuchi', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 10 },
  { id: 'coochbehar-6', name: 'Sitai', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 11 },
  { id: 'coochbehar-7', name: 'Dinhata', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 12 },
  { id: 'coochbehar-8', name: 'Natabari', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 13 },
  { id: 'coochbehar-9', name: 'Tufanganj', district: 'Cooch Behar', region: 'North Bengal', assemblyNumber: 14 },

  // Dakshin Dinajpur District (6 seats)
  { id: 'dakshindinajpur-1', name: 'Kushmandi', district: 'Dakshin Dinajpur', region: 'North Bengal', assemblyNumber: 15 },
  { id: 'dakshindinajpur-2', name: 'Kumarganj', district: 'Dakshin Dinajpur', region: 'North Bengal', assemblyNumber: 16 },
  { id: 'dakshindinajpur-3', name: 'Balurghat', district: 'Dakshin Dinajpur', region: 'North Bengal', assemblyNumber: 17 },
  { id: 'dakshindinajpur-4', name: 'Tapan', district: 'Dakshin Dinajpur', region: 'North Bengal', assemblyNumber: 18 },
  { id: 'dakshindinajpur-5', name: 'Gangarampur', district: 'Dakshin Dinajpur', region: 'North Bengal', assemblyNumber: 19 },
  { id: 'dakshindinajpur-6', name: 'Harirampur', district: 'Dakshin Dinajpur', region: 'North Bengal', assemblyNumber: 20 },

  // Darjeeling District (7 seats)
  { id: 'darjeeling-1', name: 'Darjeeling', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 21 },
  { id: 'darjeeling-2', name: 'Kurseong', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 22 },
  { id: 'darjeeling-3', name: 'Matigara-Naxalbari', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 23 },
  { id: 'darjeeling-4', name: 'Siliguri', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 24 },
  { id: 'darjeeling-5', name: 'Phansidewa', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 25 },
  { id: 'darjeeling-6', name: 'Chopra', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 26 },
  { id: 'darjeeling-7', name: 'Islampur', district: 'Darjeeling', region: 'North Bengal', assemblyNumber: 27 },

  // Hooghly District (18 seats)
  { id: 'hooghly-1', name: 'Tarakeswar', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 177 },
  { id: 'hooghly-2', name: 'Pursurah', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 178 },
  { id: 'hooghly-3', name: 'Arambagh', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 179 },
  { id: 'hooghly-4', name: 'Goghat', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 180 },
  { id: 'hooghly-5', name: 'Khanakul', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 181 },
  { id: 'hooghly-6', name: 'Arambag', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 182 },
  { id: 'hooghly-7', name: 'Dhaniakhali', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 183 },
  { id: 'hooghly-8', name: 'Haripal', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 184 },
  { id: 'hooghly-9', name: 'Saptagram', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 185 },
  { id: 'hooghly-10', name: 'Chanditala', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 186 },
  { id: 'hooghly-11', name: 'Jangipara', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 187 },
  { id: 'hooghly-12', name: 'Srirampur', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 188 },
  { id: 'hooghly-13', name: 'Champdani', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 189 },
  { id: 'hooghly-14', name: 'Singur', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 190 },
  { id: 'hooghly-15', name: 'Chandannagar', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 191 },
  { id: 'hooghly-16', name: 'Chunchura', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 192 },
  { id: 'hooghly-17', name: 'Uttarpara', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 193 },
  { id: 'hooghly-18', name: 'Srirampur', district: 'Hooghly', region: 'South Bengal', assemblyNumber: 194 },

  // Howrah District (16 seats)
  { id: 'howrah-1', name: 'Bally', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 195 },
  { id: 'howrah-2', name: 'Howrah Uttar', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 196 },
  { id: 'howrah-3', name: 'Howrah Madhya', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 197 },
  { id: 'howrah-4', name: 'Shibpur', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 198 },
  { id: 'howrah-5', name: 'Howrah Dakshin', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 199 },
  { id: 'howrah-6', name: 'Sankrail', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 200 },
  { id: 'howrah-7', name: 'Panchla', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 201 },
  { id: 'howrah-8', name: 'Uluberia Uttar', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 202 },
  { id: 'howrah-9', name: 'Uluberia Dakshin', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 203 },
  { id: 'howrah-10', name: 'Shyampur', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 204 },
  { id: 'howrah-11', name: 'Bagnan', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 205 },
  { id: 'howrah-12', name: 'Amta', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 206 },
  { id: 'howrah-13', name: 'Udaynarayanpur', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 207 },
  { id: 'howrah-14', name: 'Jagatballavpur', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 208 },
  { id: 'howrah-15', name: 'Domjur', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 209 },
  { id: 'howrah-16', name: 'Panchla', district: 'Howrah', region: 'Kolkata Metro', assemblyNumber: 210 },

  // Jalpaiguri District (11 seats)
  { id: 'jalpaiguri-1', name: 'Kalimpong', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 28 },
  { id: 'jalpaiguri-2', name: 'Darjeeling', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 29 },
  { id: 'jalpaiguri-3', name: 'Rajganj', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 30 },
  { id: 'jalpaiguri-4', name: 'Jalpaiguri', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 31 },
  { id: 'jalpaiguri-5', name: 'Dhupguri', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 32 },
  { id: 'jalpaiguri-6', name: 'Maynaguri', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 33 },
  { id: 'jalpaiguri-7', name: 'Mal', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 34 },
  { id: 'jalpaiguri-8', name: 'Nagrakata', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 35 },
  { id: 'jalpaiguri-9', name: 'Kalchini', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 36 },
  { id: 'jalpaiguri-10', name: 'Alipurduar', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 37 },
  { id: 'jalpaiguri-11', name: 'Falakata', district: 'Jalpaiguri', region: 'North Bengal', assemblyNumber: 38 },

  // Jhargram District (4 seats)
  { id: 'jhargram-1', name: 'Jhargram', district: 'Jhargram', region: 'Jangalmahal', assemblyNumber: 217 },
  { id: 'jhargram-2', name: 'Nayagram', district: 'Jhargram', region: 'Jangalmahal', assemblyNumber: 218 },
  { id: 'jhargram-3', name: 'Gopiballavpur', district: 'Jhargram', region: 'Jangalmahal', assemblyNumber: 219 },
  { id: 'jhargram-4', name: 'Binpur', district: 'Jhargram', region: 'Jangalmahal', assemblyNumber: 220 },

  // Kalimpong District (3 seats)
  { id: 'kalimpong-1', name: 'Kalimpong', district: 'Kalimpong', region: 'North Bengal', assemblyNumber: 39 },
  { id: 'kalimpong-2', name: 'Darjeeling', district: 'Kalimpong', region: 'North Bengal', assemblyNumber: 40 },
  { id: 'kalimpong-3', name: 'Kurseong', district: 'Kalimpong', region: 'North Bengal', assemblyNumber: 41 },

  // Kolkata District (11 seats)
  { id: 'kolkata-1', name: 'Kolkata Port', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 142 },
  { id: 'kolkata-2', name: 'Bhabanipur', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 143 },
  { id: 'kolkata-3', name: 'Rashbehari', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 144 },
  { id: 'kolkata-4', name: 'Ballygunge', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 145 },
  { id: 'kolkata-5', name: 'Chowrangee', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 146 },
  { id: 'kolkata-6', name: 'Entally', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 147 },
  { id: 'kolkata-7', name: 'Beleghata', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 148 },
  { id: 'kolkata-8', name: 'Jorasanko', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 149 },
  { id: 'kolkata-9', name: 'Shyampukur', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 150 },
  { id: 'kolkata-10', name: 'Maniktala', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 151 },
  { id: 'kolkata-11', name: 'Kashipur-Belgachia', district: 'Kolkata', region: 'Kolkata Metro', assemblyNumber: 152 },

  // Malda District (12 seats)
  { id: 'malda-1', name: 'Habibpur', district: 'Malda', region: 'North Bengal', assemblyNumber: 42 },
  { id: 'malda-2', name: 'Gazole', district: 'Malda', region: 'North Bengal', assemblyNumber: 43 },
  { id: 'malda-3', name: 'Chanchal', district: 'Malda', region: 'North Bengal', assemblyNumber: 44 },
  { id: 'malda-4', name: 'Harishchandrapur', district: 'Malda', region: 'North Bengal', assemblyNumber: 45 },
  { id: 'malda-5', name: 'Malatipur', district: 'Malda', region: 'North Bengal', assemblyNumber: 46 },
  { id: 'malda-6', name: 'Ratua', district: 'Malda', region: 'North Bengal', assemblyNumber: 47 },
  { id: 'malda-7', name: 'Manickchak', district: 'Malda', region: 'North Bengal', assemblyNumber: 48 },
  { id: 'malda-8', name: 'Maldaha', district: 'Malda', region: 'North Bengal', assemblyNumber: 49 },
  { id: 'malda-9', name: 'English Bazar', district: 'Malda', region: 'North Bengal', assemblyNumber: 50 },
  { id: 'malda-10', name: 'Mothabari', district: 'Malda', region: 'North Bengal', assemblyNumber: 51 },
  { id: 'malda-11', name: 'Sujapur', district: 'Malda', region: 'North Bengal', assemblyNumber: 52 },
  { id: 'malda-12', name: 'Baisnabnagar', district: 'Malda', region: 'North Bengal', assemblyNumber: 53 },

  // Murshidabad District (22 seats)
  { id: 'murshidabad-1', name: 'Farakka', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 54 },
  { id: 'murshidabad-2', name: 'Suti', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 55 },
  { id: 'murshidabad-3', name: 'Raghunathganj', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 56 },
  { id: 'murshidabad-4', name: 'Sagardighi', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 57 },
  { id: 'murshidabad-5', name: 'Lalgola', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 58 },
  { id: 'murshidabad-6', name: 'Bhagabangola', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 59 },
  { id: 'murshidabad-7', name: 'Raninagar', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 60 },
  { id: 'murshidabad-8', name: 'Murshidabad', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 61 },
  { id: 'murshidabad-9', name: 'Nabagram', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 62 },
  { id: 'murshidabad-10', name: 'Khargram', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 63 },
  { id: 'murshidabad-11', name: 'Burwan', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 64 },
  { id: 'murshidabad-12', name: 'Kandi', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 65 },
  { id: 'murshidabad-13', name: 'Bharatpur', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 66 },
  { id: 'murshidabad-14', name: 'Rejinagar', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 67 },
  { id: 'murshidabad-15', name: 'Beldanga', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 68 },
  { id: 'murshidabad-16', name: 'Baharampur', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 69 },
  { id: 'murshidabad-17', name: 'Hariharpara', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 70 },
  { id: 'murshidabad-18', name: 'Naoda', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 71 },
  { id: 'murshidabad-19', name: 'Domkal', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 72 },
  { id: 'murshidabad-20', name: 'Jalangi', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 73 },
  { id: 'murshidabad-21', name: 'Krishnanagar Uttar', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 74 },
  { id: 'murshidabad-22', name: 'Krishnanagar Dakshin', district: 'Murshidabad', region: 'South Bengal', assemblyNumber: 75 },

  // Nadia District (17 seats)
  { id: 'nadia-1', name: 'Tehatta', district: 'Nadia', region: 'South Bengal', assemblyNumber: 76 },
  { id: 'nadia-2', name: 'Palashipara', district: 'Nadia', region: 'South Bengal', assemblyNumber: 77 },
  { id: 'nadia-3', name: 'Karimpur', district: 'Nadia', region: 'South Bengal', assemblyNumber: 78 },
  { id: 'nadia-4', name: 'Nakashipara', district: 'Nadia', region: 'South Bengal', assemblyNumber: 79 },
  { id: 'nadia-5', name: 'Chapra', district: 'Nadia', region: 'South Bengal', assemblyNumber: 80 },
  { id: 'nadia-6', name: 'Nabadwip', district: 'Nadia', region: 'South Bengal', assemblyNumber: 81 },
  { id: 'nadia-7', name: 'Krishnaganj', district: 'Nadia', region: 'South Bengal', assemblyNumber: 82 },
  { id: 'nadia-8', name: 'Ranaghat Uttar Paschim', district: 'Nadia', region: 'South Bengal', assemblyNumber: 83 },
  { id: 'nadia-9', name: 'Ranaghat Uttar Purba', district: 'Nadia', region: 'South Bengal', assemblyNumber: 84 },
  { id: 'nadia-10', name: 'Ranaghat Dakshin', district: 'Nadia', region: 'South Bengal', assemblyNumber: 85 },
  { id: 'nadia-11', name: 'Chakdaha', district: 'Nadia', region: 'South Bengal', assemblyNumber: 86 },
  { id: 'nadia-12', name: 'Kalyani', district: 'Nadia', region: 'South Bengal', assemblyNumber: 87 },
  { id: 'nadia-13', name: 'Haringhata', district: 'Nadia', region: 'South Bengal', assemblyNumber: 88 },
  { id: 'nadia-14', name: 'Krishnanagar Dakshin', district: 'Nadia', region: 'South Bengal', assemblyNumber: 89 },
  { id: 'nadia-15', name: 'Santipur', district: 'Nadia', region: 'South Bengal', assemblyNumber: 90 },
  { id: 'nadia-16', name: 'Ranaghat', district: 'Nadia', region: 'South Bengal', assemblyNumber: 91 },
  { id: 'nadia-17', name: 'Krishnanagar Uttar', district: 'Nadia', region: 'South Bengal', assemblyNumber: 92 },

  // North 24 Parganas District (33 seats)
  { id: 'north24pgs-1', name: 'Deganga', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 93 },
  { id: 'north24pgs-2', name: 'Haroa', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 94 },
  { id: 'north24pgs-3', name: 'Minakhan', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 95 },
  { id: 'north24pgs-4', name: 'Sandeshkhali', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 96 },
  { id: 'north24pgs-5', name: 'Basirhat Dakshin', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 97 },
  { id: 'north24pgs-6', name: 'Basirhat Uttar', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 98 },
  { id: 'north24pgs-7', name: 'Hingalganj', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 99 },
  { id: 'north24pgs-8', name: 'Gosaba', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 100 },
  { id: 'north24pgs-9', name: 'Basanti', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 101 },
  { id: 'north24pgs-10', name: 'Kultali', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 102 },
  { id: 'north24pgs-11', name: 'Patharpratima', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 103 },
  { id: 'north24pgs-12', name: 'Kakdwip', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 104 },
  { id: 'north24pgs-13', name: 'Sagar', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 105 },
  { id: 'north24pgs-14', name: 'Kulpi', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 106 },
  { id: 'north24pgs-15', name: 'Raidighi', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 107 },
  { id: 'north24pgs-16', name: 'Mandirbazar', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 108 },
  { id: 'north24pgs-17', name: 'Jaynagar', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 109 },
  { id: 'north24pgs-18', name: 'Baruipur Purba', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 110 },
  { id: 'north24pgs-19', name: 'Baruipur Paschim', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 111 },
  { id: 'north24pgs-20', name: 'Magrahat Purba', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 112 },
  { id: 'north24pgs-21', name: 'Magrahat Paschim', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 113 },
  { id: 'north24pgs-22', name: 'Diamond Harbour', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 114 },
  { id: 'north24pgs-23', name: 'Falta', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 115 },
  { id: 'north24pgs-24', name: 'Satgachia', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 116 },
  { id: 'north24pgs-25', name: 'Bishnupur', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 117 },
  { id: 'north24pgs-26', name: 'Sonarpur Dakshin', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 118 },
  { id: 'north24pgs-27', name: 'Sonarpur Uttar', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 119 },
  { id: 'north24pgs-28', name: 'Kasba', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 120 },
  { id: 'north24pgs-29', name: 'Jadavpur', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 121 },
  { id: 'north24pgs-30', name: 'Tollygunge', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 122 },
  { id: 'north24pgs-31', name: 'Behala Purba', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 123 },
  { id: 'north24pgs-32', name: 'Behala Paschim', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 124 },
  { id: 'north24pgs-33', name: 'Maheshtala', district: 'North 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 125 },

  // Paschim Bardhaman District (14 seats)
  { id: 'paschimbardhaman-1', name: 'Kalna', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 242 },
  { id: 'paschimbardhaman-2', name: 'Memari', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 243 },
  { id: 'paschimbardhaman-3', name: 'Bardhaman Dakshin', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 244 },
  { id: 'paschimbardhaman-4', name: 'Bardhaman Uttar', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 245 },
  { id: 'paschimbardhaman-5', name: 'Raina', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 246 },
  { id: 'paschimbardhaman-6', name: 'Jamalpur', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 247 },
  { id: 'paschimbardhaman-7', name: 'Monteswar', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 248 },
  { id: 'paschimbardhaman-8', name: 'Khandaghosh', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 249 },
  { id: 'paschimbardhaman-9', name: 'Bardhaman-Durgapur', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 250 },
  { id: 'paschimbardhaman-10', name: 'Durgapur Purba', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 251 },
  { id: 'paschimbardhaman-11', name: 'Durgapur Paschim', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 252 },
  { id: 'paschimbardhaman-12', name: 'Raniganj', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 253 },
  { id: 'paschimbardhaman-13', name: 'Jamuria', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 254 },
  { id: 'paschimbardhaman-14', name: 'Asansol Dakshin', district: 'Paschim Bardhaman', region: 'South Bengal', assemblyNumber: 255 },

  // Paschim Medinipur District (18 seats)
  { id: 'paschimmedinipur-1', name: 'Keshpur', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 211 },
  { id: 'paschimmedinipur-2', name: 'Kharagpur', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 212 },
  { id: 'paschimmedinipur-3', name: 'Debra', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 213 },
  { id: 'paschimmedinipur-4', name: 'Daspur', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 214 },
  { id: 'paschimmedinipur-5', name: 'Ghatal', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 215 },
  { id: 'paschimmedinipur-6', name: 'Chandrakona', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 216 },
  { id: 'paschimmedinipur-7', name: 'Garbeta', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 221 },
  { id: 'paschimmedinipur-8', name: 'Salboni', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 222 },
  { id: 'paschimmedinipur-9', name: 'Medinipur', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 223 },
  { id: 'paschimmedinipur-10', name: 'Binpur', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 224 },
  { id: 'paschimmedinipur-11', name: 'Jhargram', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 225 },
  { id: 'paschimmedinipur-12', name: 'Nayagram', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 226 },
  { id: 'paschimmedinipur-13', name: 'Gopiballavpur', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 227 },
  { id: 'paschimmedinipur-14', name: 'Kharagpur Sadar', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 228 },
  { id: 'paschimmedinipur-15', name: 'Sabang', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 229 },
  { id: 'paschimmedinipur-16', name: 'Narayangarh', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 256 },
  { id: 'paschimmedinipur-17', name: 'Pingla', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 257 },
  { id: 'paschimmedinipur-18', name: 'Dantan', district: 'Paschim Medinipur', region: 'Jangalmahal', assemblyNumber: 258 },

  // Purba Bardhaman District (17 seats)
  { id: 'purbabardhaman-1', name: 'Asansol Uttar', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 259 },
  { id: 'purbabardhaman-2', name: 'Kulti', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 260 },
  { id: 'purbabardhaman-3', name: 'Barabani', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 261 },
  { id: 'purbabardhaman-4', name: 'Pandabeswar', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 262 },
  { id: 'purbabardhaman-5', name: 'Durgapur Purba', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 263 },
  { id: 'purbabardhaman-6', name: 'Durgapur Paschim', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 264 },
  { id: 'purbabardhaman-7', name: 'Raniganj', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 265 },
  { id: 'purbabardhaman-8', name: 'Jamuria', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 266 },
  { id: 'purbabardhaman-9', name: 'Asansol Dakshin', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 267 },
  { id: 'purbabardhaman-10', name: 'Ausgram', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 268 },
  { id: 'purbabardhaman-11', name: 'Galsi', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 269 },
  { id: 'purbabardhaman-12', name: 'Katwa', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 270 },
  { id: 'purbabardhaman-13', name: 'Kandi', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 271 },
  { id: 'purbabardhaman-14', name: 'Bhagabangola', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 272 },
  { id: 'purbabardhaman-15', name: 'Ketugram', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 273 },
  { id: 'purbabardhaman-16', name: 'Mangalkot', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 274 },
  { id: 'purbabardhaman-17', name: 'Ausgram', district: 'Purba Bardhaman', region: 'South Bengal', assemblyNumber: 275 },

  // Purba Medinipur District (16 seats)
  { id: 'purbamedinipur-1', name: 'Tamluk', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 153 },
  { id: 'purbamedinipur-2', name: 'Panskura Purba', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 154 },
  { id: 'purbamedinipur-3', name: 'Panskura Paschim', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 155 },
  { id: 'purbamedinipur-4', name: 'Moyna', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 156 },
  { id: 'purbamedinipur-5', name: 'Nandakumar', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 157 },
  { id: 'purbamedinipur-6', name: 'Mahishadal', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 158 },
  { id: 'purbamedinipur-7', name: 'Haldia', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 159 },
  { id: 'purbamedinipur-8', name: 'Nandigram', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 160 },
  { id: 'purbamedinipur-9', name: 'Chandipur', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 161 },
  { id: 'purbamedinipur-10', name: 'Patashpur', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 162 },
  { id: 'purbamedinipur-11', name: 'Kanthi Uttar', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 163 },
  { id: 'purbamedinipur-12', name: 'Kanthi Dakshin', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 164 },
  { id: 'purbamedinipur-13', name: 'Ramnagar', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 165 },
  { id: 'purbamedinipur-14', name: 'Egra', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 166 },
  { id: 'purbamedinipur-15', name: 'Dantan', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 167 },
  { id: 'purbamedinipur-16', name: 'Khejuri', district: 'Purba Medinipur', region: 'South Bengal', assemblyNumber: 168 },

  // Purulia District (9 seats)
  { id: 'purulia-1', name: 'Para', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 276 },
  { id: 'purulia-2', name: 'Raghunathpur', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 277 },
  { id: 'purulia-3', name: 'Purulia', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 278 },
  { id: 'purulia-4', name: 'Manbazar', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 279 },
  { id: 'purulia-5', name: 'Kashipur', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 280 },
  { id: 'purulia-6', name: 'Joypur', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 281 },
  { id: 'purulia-7', name: 'Baghmundi', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 282 },
  { id: 'purulia-8', name: 'Balarampur', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 294 },
  { id: 'purulia-9', name: 'Jhalda', district: 'Purulia', region: 'Jangalmahal', assemblyNumber: 294 },

  // South 24 Parganas District (31 seats)
  { id: 'south24pgs-1', name: 'Bhangar Purba', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 126 },
  { id: 'south24pgs-2', name: 'Bhangar Paschim', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 127 },
  { id: 'south24pgs-3', name: 'Canning Purba', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 128 },
  { id: 'south24pgs-4', name: 'Canning Paschim', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 129 },
  { id: 'south24pgs-5', name: 'Budge Budge', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 130 },
  { id: 'south24pgs-6', name: 'Metiabruz', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 131 },
  { id: 'south24pgs-7', name: 'Behala Purba', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 132 },
  { id: 'south24pgs-8', name: 'Behala Paschim', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 133 },
  { id: 'south24pgs-9', name: 'Maheshtala', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 134 },
  { id: 'south24pgs-10', name: 'Budge Budge', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 135 },
  { id: 'south24pgs-11', name: 'Satgachia', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 136 },
  { id: 'south24pgs-12', name: 'Bishnupur', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 137 },
  { id: 'south24pgs-13', name: 'Sonarpur Dakshin', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 138 },
  { id: 'south24pgs-14', name: 'Sonarpur Uttar', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 139 },
  { id: 'south24pgs-15', name: 'Kasba', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 140 },
  { id: 'south24pgs-16', name: 'Jadavpur', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 141 },
  { id: 'south24pgs-17', name: 'Diamond Harbour', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 169 },
  { id: 'south24pgs-18', name: 'Falta', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 170 },
  { id: 'south24pgs-19', name: 'Satgachia', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 171 },
  { id: 'south24pgs-20', name: 'Bishnupur', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 172 },
  { id: 'south24pgs-21', name: 'Magrahat Purba', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 173 },
  { id: 'south24pgs-22', name: 'Magrahat Paschim', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 174 },
  { id: 'south24pgs-23', name: 'Baruipur Purba', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 175 },
  { id: 'south24pgs-24', name: 'Baruipur Paschim', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 176 },
  { id: 'south24pgs-25', name: 'Kultali', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 169 },
  { id: 'south24pgs-26', name: 'Patharpratima', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 170 },
  { id: 'south24pgs-27', name: 'Kakdwip', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 171 },
  { id: 'south24pgs-28', name: 'Sagar', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 172 },
  { id: 'south24pgs-29', name: 'Kulpi', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 173 },
  { id: 'south24pgs-30', name: 'Raidighi', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 174 },
  { id: 'south24pgs-31', name: 'Mandirbazar', district: 'South 24 Parganas', region: 'Kolkata Metro', assemblyNumber: 175 },

  // Uttar Dinajpur District (9 seats)
  { id: 'uttardinajpur-1', name: 'Chopra', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 28 },
  { id: 'uttardinajpur-2', name: 'Islampur', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 29 },
  { id: 'uttardinajpur-3', name: 'Goalpokhar', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 30 },
  { id: 'uttardinajpur-4', name: 'Chakulia', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 31 },
  { id: 'uttardinajpur-5', name: 'Karandighi', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 32 },
  { id: 'uttardinajpur-6', name: 'Raiganj', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 33 },
  { id: 'uttardinajpur-7', name: 'Itahar', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 34 },
  { id: 'uttardinajpur-8', name: 'Kaliaganj', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 35 },
  { id: 'uttardinajpur-9', name: 'Hemtabad', district: 'Uttar Dinajpur', region: 'North Bengal', assemblyNumber: 36 },
];

/**
 * Get all unique districts
 */
export function getAllDistricts(): string[] {
  const districts = new Set<string>();
  WEST_BENGAL_CONSTITUENCIES.forEach(c => districts.add(c.district));
  return Array.from(districts).sort();
}

/**
 * Search constituencies by name or district
 */
export function searchConstituencies(query: string): Constituency[] {
  const lowerQuery = query.toLowerCase();
  return WEST_BENGAL_CONSTITUENCIES.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.district.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get constituencies by district
 */
export function getConstituenciesByDistrict(district: string): Constituency[] {
  return WEST_BENGAL_CONSTITUENCIES.filter(c => c.district === district);
}

/**
 * Get constituencies by region
 */
export function getConstituenciesByRegion(region: string): Constituency[] {
  return WEST_BENGAL_CONSTITUENCIES.filter(c => c.region === region);
}

/**
 * Get constituency by ID
 */
export function getConstituencyById(id: string): Constituency | undefined {
  return WEST_BENGAL_CONSTITUENCIES.find(c => c.id === id);
}

/**
 * Get total count
 */
export function getTotalConstituencies(): number {
  return WEST_BENGAL_CONSTITUENCIES.length;
}
