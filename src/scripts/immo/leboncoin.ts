import { getAnnoncesLbc, logger } from '../../utils';

getAnnoncesLbc([
  'Laugier',
  'Poncelet',
  'Niel',
  'Saussier Leroy',
  'Fourcroy',
  'Renaudes',
  'Rennequin',
  'Bayen',
  'Boulnois',
  'Pierre Demours',
  'Sergent Hoff',
  'Marcel Renault',
  'Villebois Mareuil',
  'Torricelli',
  // 'Lebon',
  'Faraday',
  'Saint Sénoch',
  'Aublet',
]).catch((err) => {
  logger.error('leboncoin : ' + err.message);
});
